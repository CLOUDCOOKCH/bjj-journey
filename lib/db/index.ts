import { drizzle as drizzleNeon } from 'drizzle-orm/neon-http'
import { drizzle as drizzlePostgres } from 'drizzle-orm/node-postgres'
import { neon } from '@neondatabase/serverless'
import { Pool } from 'pg'
import * as schema from './schema'

function createDatabase() {
  const driver = process.env.DB_DRIVER ?? 'neon'
  const connectionString = process.env.DATABASE_URL
  if (driver === 'postgres') {
    return drizzlePostgres(new Pool({ connectionString, connectionTimeoutMillis: 5000 }), { schema })
  }
  if (driver !== 'neon') throw new Error('DB_DRIVER must be neon or postgres')
  return drizzleNeon(neon(connectionString!), { schema })
}

const globalDatabase = globalThis as typeof globalThis & { bjjDatabase?: ReturnType<typeof createDatabase> }

export const db = globalDatabase.bjjDatabase ?? createDatabase()
if (process.env.NODE_ENV === 'development') globalDatabase.bjjDatabase = db
