import { neon } from '@neondatabase/serverless'
import pg from 'pg'

export async function withDatabase(run) {
  const driver = process.env.DB_DRIVER ?? 'neon'
  const connectionString = process.env.DATABASE_URL
  if (driver === 'neon') {
    if (!connectionString) throw new DatabaseConfigError('Set DATABASE_URL for the intended Neon database')
    const sql = neon(connectionString)
    return run({
      query: (statement, values) => sql.query(statement, values),
      transaction: (commands) => sql.transaction(commands.map(([statement, values]) => sql.query(statement, values))),
    })
  }
  if (driver !== 'postgres') throw new DatabaseConfigError('DB_DRIVER must be neon or postgres')

  const pool = new pg.Pool({ connectionString, connectionTimeoutMillis: 5000 })
  try {
    return await run({
      query: async (statement, values) => (await pool.query(statement, values)).rows,
      transaction: async (commands) => {
        const client = await pool.connect()
        try {
          await client.query('BEGIN')
          for (const [statement, values] of commands) await client.query(statement, values)
          await client.query('COMMIT')
        } catch (error) {
          try {
            await client.query('ROLLBACK')
          } finally {
            throw error
          }
        } finally {
          client.release()
        }
      },
    })
  } finally {
    await pool.end()
  }
}

export class DatabaseConfigError extends Error {}
