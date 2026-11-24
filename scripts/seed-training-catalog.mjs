import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { createRequire } from 'node:module'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseConfigError, withDatabase } from './database.mjs'

class CatalogSeedError extends Error {}

const require = createRequire(import.meta.url)
const counts = { mobility: 40, strength: 50, conditioning: 15, solo: 20, recovery: 10 }

function loadCatalog() {
  const build = mkdtempSync(join(tmpdir(), 'bjj-catalog-'))
  const catalog = fileURLToPath(new URL('../lib/training/catalog/index.ts', import.meta.url))
  try {
    const result = spawnSync(process.execPath, [
      require.resolve('typescript/bin/tsc'), '--module', 'NodeNext', '--target', 'ES2020',
      '--skipLibCheck', '--strict', '--outDir', build, catalog,
    ], { encoding: 'utf8' })
    if (result.status !== 0) {
      throw new CatalogSeedError('Could not compile the training catalog. Run the TypeScript check for details.')
    }
    return require(join(build, 'index.js')).exerciseCatalog
  } finally {
    rmSync(build, { recursive: true, force: true })
  }
}

export function catalogSeedRows() {
  const catalog = loadCatalog()
  const slugs = new Set(catalog.map(({ slug }) => slug))
  if (slugs.size !== catalog.length) throw new CatalogSeedError('The curated exercise catalog repeats a stable ID')
  for (const [category, minimum] of Object.entries(counts)) {
    if (catalog.filter((entry) => entry.category === category).length < minimum) {
      throw new CatalogSeedError(`The ${category} catalog contains fewer than ${minimum} entries`)
    }
  }
  return catalog.map((data) => ({ slug: data.slug, category: data.category, data }))
}

export async function seedCatalog(query, rows) {
  return query.query(`
    WITH upserted AS (
      INSERT INTO training_exercise_catalog AS catalog (slug, category, data)
      SELECT item.slug, item.category, item.data
      FROM jsonb_to_recordset($1::jsonb) AS item(slug text, category text, data jsonb)
      ON CONFLICT (slug) DO UPDATE SET category = EXCLUDED.category, data = EXCLUDED.data, updated_at = now()
      WHERE (catalog.category, catalog.data) IS DISTINCT FROM (EXCLUDED.category, EXCLUDED.data)
      RETURNING slug
    )
    SELECT count(*)::integer AS changed FROM upserted
  `, [JSON.stringify(rows)])
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] ?? '--check'
  try {
    if (!['--check', '--apply'].includes(mode)) throw new CatalogSeedError('Use --check or --apply')
    const rows = catalogSeedRows()
    if (mode === '--check') {
      console.log(`Verified ${rows.length} curated exercises and stable IDs.`)
    } else {
      const [{ changed }] = await withDatabase((database) => seedCatalog(database, rows))
      console.log(`Processed ${rows.length} curated exercises. ${changed} inserted or updated.`)
    }
  } catch (error) {
    if (error instanceof CatalogSeedError || error instanceof DatabaseConfigError) console.error(error.message)
    else console.error(`Catalog seed stopped${/^[A-Z0-9]{5}$/.test(error?.code ?? '') ? ` (database code ${error.code})` : ''}`)
    process.exitCode = 1
  }
}
