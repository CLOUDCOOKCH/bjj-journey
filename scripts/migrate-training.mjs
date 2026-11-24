import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { DatabaseConfigError, withDatabase } from './database.mjs'
import { readMigrationFiles } from 'drizzle-orm/migrator'

class MigrationCheckError extends Error {}

const migrationDir = fileURLToPath(new URL('../drizzle/', import.meta.url))
const migrations = readMigrationFiles({ migrationsFolder: migrationDir })
const legacySnapshot = JSON.parse(readFileSync(new URL('../drizzle/meta/0003_snapshot.json', import.meta.url), 'utf8'))
const reconciliationSnapshot = JSON.parse(readFileSync(new URL('../drizzle/meta/0004_snapshot.json', import.meta.url), 'utf8'))
const legacyCount = 4
const reviewTables = ['review_techniques', 'review_technique_videos']

const ledger = 'drizzle.__drizzle_migrations'
const inventoryQuery = `
  SELECT relation.relname AS name, relation.relrowsecurity AS "rowSecurity",
    (SELECT jsonb_object_agg(attribute.attname, jsonb_build_object(
      'type', format_type(attribute.atttypid, attribute.atttypmod),
      'notNull', attribute.attnotnull,
      'default', pg_get_expr(defaults.adbin, defaults.adrelid)
    )) FROM pg_attribute attribute
    LEFT JOIN pg_attrdef defaults ON defaults.adrelid = attribute.attrelid AND defaults.adnum = attribute.attnum
    WHERE attribute.attrelid = relation.oid AND attribute.attnum > 0 AND NOT attribute.attisdropped) AS columns,
    (SELECT coalesce(jsonb_object_agg(conname, pg_get_constraintdef(oid)), '{}'::jsonb)
      FROM pg_constraint WHERE conrelid = relation.oid) AS constraints,
    (SELECT coalesce(jsonb_object_agg(indexname, indexdef), '{}'::jsonb)
      FROM pg_indexes WHERE schemaname = 'public' AND tablename = relation.relname) AS indexes
  FROM pg_class relation JOIN pg_namespace namespace ON namespace.oid = relation.relnamespace
  WHERE namespace.nspname = 'public' AND relation.relkind IN ('r','p')
`

const identifier = (value) => /^[a-z_][a-z0-9_]*$/.test(value) ? value : `"${value.replaceAll('"', '""')}"`
const keyList = (values) => values.map(identifier).join(', ')
const typeName = (value) => value.replace(/^varchar/, 'character varying').replace(/^timestamp$/, 'timestamp without time zone')
const defaultExpression = (value) => value === undefined || value === null ? null : String(value).replace(/::(?:character varying|text)$/, '')

function expectedLegacyTables(inventory) {
  const expected = Object.values(legacySnapshot.tables)
  if (inventory.some(({ name }) => reviewTables.includes(name))) {
    expected.push(...reviewTables.map((name) => reconciliationSnapshot.tables[`public.${name}`]))
  }
  return expected
}

export function verifyLegacySchema(inventory) {
  const tables = expectedLegacyTables(inventory)
  const actual = new Map(inventory.map((table) => [table.name, table]))
  const expectedNames = new Set(tables.map(({ name }) => name))
  if (inventory.length !== tables.length || inventory.some(({ name }) => !expectedNames.has(name))) {
    throw new MigrationCheckError('Existing tables do not match a supported legacy schema')
  }

  for (const table of tables) {
    const current = actual.get(table.name)
    if (!current || current.rowSecurity !== table.isRLSEnabled) throw new MigrationCheckError(`Unexpected legacy table: ${table.name}`)
    const columns = Object.values(table.columns)
    if (columns.length !== Object.keys(current.columns).length) throw new MigrationCheckError(`Unexpected legacy columns: ${table.name}`)
    for (const column of columns) {
      const present = current.columns[column.name]
      if (!present || present.type !== typeName(column.type) || present.notNull !== column.notNull
          || defaultExpression(present.default) !== defaultExpression(column.default)) {
        throw new MigrationCheckError(`Unexpected legacy column: ${table.name}.${column.name}`)
      }
    }

    const expectedConstraints = {}
    const primaryColumns = columns.filter(({ primaryKey }) => primaryKey).map(({ name }) => name)
    if (primaryColumns.length) expectedConstraints[`${table.name}_pkey`] = `PRIMARY KEY (${keyList(primaryColumns)})`
    for (const unique of Object.values(table.uniqueConstraints)) {
      expectedConstraints[unique.name] = `UNIQUE (${keyList(unique.columns)})`
    }
    for (const key of Object.values(table.foreignKeys)) {
      const onUpdate = key.onUpdate && key.onUpdate !== 'no action' ? ` ON UPDATE ${key.onUpdate.toUpperCase()}` : ''
      const onDelete = key.onDelete && key.onDelete !== 'no action' ? ` ON DELETE ${key.onDelete.toUpperCase()}` : ''
      expectedConstraints[key.name.slice(0, 63)] =
        `FOREIGN KEY (${keyList(key.columnsFrom)}) REFERENCES ${identifier(key.tableTo)}(${keyList(key.columnsTo)})${onUpdate}${onDelete}`
    }
    if (Object.keys(current.constraints).length !== Object.keys(expectedConstraints).length) {
      throw new MigrationCheckError(`Unexpected legacy constraints: ${table.name}`)
    }
    for (const [name, definition] of Object.entries(expectedConstraints)) {
      if (current.constraints[name] !== definition) throw new MigrationCheckError(`Unexpected legacy constraint: ${name}`)
    }

    for (const index of Object.values(table.indexes)) {
      const definition = `CREATE ${index.isUnique ? 'UNIQUE ' : ''}INDEX ${identifier(index.name)} ON public.${identifier(table.name)} USING ${index.method} (${keyList(index.columns.map(({ expression }) => expression))})`
      if (current.indexes[index.name] !== definition) throw new MigrationCheckError(`Unexpected legacy index: ${index.name}`)
    }
  }
}

async function ensureLedger(query) {
  await query.transaction([
    ['CREATE SCHEMA IF NOT EXISTS drizzle'],
    [`CREATE TABLE IF NOT EXISTS ${ledger} (id serial PRIMARY KEY, hash text NOT NULL, created_at bigint)`],
  ])
}

// Recheck progress after taking the lock to keep concurrent invocations from applying the same SQL twice.
async function writeMigrations(query, records, expectedCount, statements = []) {
  await query.transaction([
    ['SELECT pg_advisory_xact_lock(177110558, 2)'],
    [`SELECT 1 / CASE WHEN count(*) = $1::integer THEN 1 ELSE 0 END FROM ${ledger}`, [expectedCount]],
    ...statements.map((statement) => [statement]),
    ...records.map(({ hash, folderMillis }) => [`INSERT INTO ${ledger} (hash, created_at) VALUES ($1, $2)`, [hash, folderMillis]]),
  ])
}

export async function migrate(query, mode) {
  const [{ exists }] = await query.query("SELECT to_regclass('drizzle.__drizzle_migrations') IS NOT NULL AS exists")
  const applied = exists ? await query.query(`SELECT hash, created_at FROM ${ledger} ORDER BY created_at, id`) : []
  if (applied.length > migrations.length || applied.some((row, index) =>
    row.hash !== migrations[index].hash || Number(row.created_at) !== migrations[index].folderMillis
  )) {
    throw new MigrationCheckError('Migration ledger differs from the repository. Review the database before applying any changes.')
  }

  const inventory = await query.query(inventoryQuery)
  if (mode === '--baseline-legacy') {
    if (applied.length) throw new MigrationCheckError('Legacy baseline requires an empty migration ledger')
    verifyLegacySchema(inventory)
    await ensureLedger(query)
    await writeMigrations(query, migrations.slice(0, legacyCount), 0)
    console.log('Verified the legacy schema and recorded four historical migrations. Run --apply to continue.')
    return
  }
  if (!applied.length && inventory.length) {
    verifyLegacySchema(inventory)
    throw new MigrationCheckError('Verified legacy tables with an empty migration ledger. Use --baseline-legacy after reviewing your backup and schema.')
  }
  if (applied.length === legacyCount) verifyLegacySchema(inventory)
  if (mode === '--check') {
    console.log(`Migration ledger verified. ${migrations.length - applied.length} pending migration(s).`)
    return
  }
  await ensureLedger(query)
  for (let index = applied.length; index < migrations.length; index++) {
    const migration = migrations[index]
    await writeMigrations(query, [migration], index, migration.sql.filter((statement) => statement.trim()))
    console.log(`Applied migration ${index.toString().padStart(4, '0')}`)
  }
  console.log('Migration ledger is current.')
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const mode = process.argv[2] ?? '--check'
  if (!['--check', '--apply', '--baseline-legacy'].includes(mode)) {
    console.error('Use --check, --apply or --baseline-legacy')
    process.exitCode = 1
  } else {
    try {
      await withDatabase((database) => migrate(database, mode))
    } catch (error) {
      // Do not print connection URLs, query parameters or provider response details.
      if (error instanceof MigrationCheckError || error instanceof DatabaseConfigError) console.error(error.message)
      else console.error(`Migration stopped${/^[A-Z0-9]{5}$/.test(error?.code ?? '') ? ` (database code ${error.code})` : ''}`)
      process.exitCode = 1
    }
  }
}
