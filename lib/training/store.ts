import 'server-only'

import { randomUUID } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { db } from '@/lib/db'
import { ApiError } from '@/lib/api/errors'
import type { TrainingPage, TrainingRecord } from './client'
import type { TrainingCollection, TrainingData } from './schemas'
import { z } from 'zod'

type RawRecord<T extends Record<string, unknown>> = TrainingRecord<T> & { cursorTime?: string } & Record<string, unknown>

const fields = sql`id, version, data, created_at AS "createdAt", updated_at AS "updatedAt"`
const cursorSchema = z.tuple([
  z.string().regex(/^\d{4}-\d\d-\d\d \d\d:\d\d:\d\d(?:\.\d+)?[+-]\d\d(?::\d\d)?$/),
  z.string().uuid(),
])

function parseCursor(encoded: string) {
  try {
    return cursorSchema.parse(JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')))
  } catch {
    throw new ApiError(400, 'Invalid cursor')
  }
}

function mapRow<T extends Record<string, unknown>>(row: RawRecord<T>): TrainingRecord<T> {
  return {
    id: row.id, version: row.version, data: row.data,
    createdAt: new Date(row.createdAt).toISOString(),
    updatedAt: new Date(row.updatedAt).toISOString(),
  }
}

class TrainingStoreError extends Error {
  constructor(public code: string, public databaseMessage: string) {
    super(databaseMessage)
  }
}

async function execute<T extends Record<string, unknown>>(query: ReturnType<typeof sql>) {
  try {
    return (await db.execute<T>(query)).rows
  } catch (error) {
    for (let cause: unknown = error; cause instanceof Error; cause = cause.cause) {
      const code = (cause as { code?: string }).code
      if (code) throw new TrainingStoreError(code, cause.message)
    }
    throw error
  }
}

export function translateTrainingError(error: unknown) {
  if (error instanceof TrainingStoreError) {
    switch (error.code) {
      case 'BJ404': return new ApiError(404, error.databaseMessage)
      case 'BJ409': return new ApiError(409, error.databaseMessage)
      case 'BJ422': return new ApiError(422, error.databaseMessage)
      case '23505': return new ApiError(409, 'This training record already exists')
      case '23503': return new ApiError(409, 'This record is still in use or its reference is unavailable')
    }
  }
  return error
}

export async function listRecords<T extends Record<string, unknown>>(
  owner: string, collection: TrainingCollection, limit: number, cursor?: string
): Promise<TrainingPage<T>> {
  const before = cursor ? parseCursor(cursor) : undefined
  const position = before ? sql`AND (created_at, id) < (${before[0]}::timestamptz, ${before[1]}::uuid)` : sql.empty()
  const rows = await execute<RawRecord<T>>(sql`
    SELECT ${fields}, created_at::text AS "cursorTime" FROM training_records
    WHERE user_id = ${owner}::uuid AND collection = ${collection} ${position}
    ORDER BY created_at DESC, id DESC LIMIT ${limit + 1}
  `)
  const page = rows.slice(0, limit)
  const last = page.at(-1)
  return {
    items: page.map(mapRow),
    nextCursor: rows.length > limit && last
      ? Buffer.from(JSON.stringify([last.cursorTime, last.id])).toString('base64url')
      : null,
  }
}

export async function getRecord<T extends Record<string, unknown>>(owner: string, collection: TrainingCollection, id: string) {
  const [row] = await execute<RawRecord<T>>(sql`
    SELECT ${fields} FROM training_records WHERE user_id = ${owner}::uuid AND collection = ${collection} AND id = ${id}::uuid
  `)
  if (!row) throw new ApiError(404, 'Training record unavailable')
  return mapRow(row)
}

export async function saveRecord<T extends Record<string, unknown>>(
  owner: string, collection: TrainingCollection, data: T, id = randomUUID() as string, version?: number
) {
  const [row] = await execute<RawRecord<T>>(sql`
    SELECT ${fields} FROM public.save_training_record(
      ${owner}::uuid, ${id}::uuid, ${collection}, ${version ?? null}::integer, ${JSON.stringify(data)}::jsonb
    )
  `)
  return mapRow(row)
}

export async function saveActivityBatch(owner: string, items: { id: string; data: TrainingData<'activities'> }[]) {
  const rows = await execute<RawRecord<TrainingData<'activities'>>>(sql`
    SELECT saved.id, saved.version, saved.data, saved.created_at AS "createdAt", saved.updated_at AS "updatedAt"
    FROM jsonb_to_recordset(${JSON.stringify(items)}::jsonb) AS item(id uuid, data jsonb)
    CROSS JOIN LATERAL public.save_training_record(${owner}::uuid, item.id, 'activities', NULL, item.data) AS saved
  `)
  return rows.map(mapRow)
}

export async function deleteRecord(owner: string, collection: TrainingCollection, id: string, version: number) {
  await execute(sql`SELECT public.delete_training_record(${owner}::uuid, ${id}::uuid, ${collection}, ${version}::integer)`)
}

export async function completeWorkout(owner: string, id: string, version: number) {
  const [row] = await execute<RawRecord<TrainingData<'workouts'>>>(sql`
    SELECT ${fields} FROM public.complete_training_workout(${owner}::uuid, ${id}::uuid, ${version}::integer)
  `)
  return mapRow(row)
}

export async function completeJournalActivity(owner: string, id: string, version: number, entry: { journalEntryId?: string; data?: unknown }) {
  const [row] = await execute<RawRecord<TrainingData<'activities'>>>(sql`
    SELECT ${fields} FROM public.complete_training_journal_activity(
      ${owner}::uuid, ${id}::uuid, ${version}::integer, ${entry.journalEntryId ?? null}::uuid,
      ${entry.data === undefined ? null : JSON.stringify(entry.data)}::jsonb
    )
  `)
  return mapRow(row)
}
