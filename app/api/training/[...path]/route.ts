import { z } from 'zod'
import { getCurrentUser } from '@/lib/api/auth'
import { ApiError } from '@/lib/api/errors'
import { activitySchema, isTrainingCollection, trainingSchemas, uuid, version } from '@/lib/training/schemas'
import { journalEntrySchema } from '@/lib/validations/schema'
import {
  completeJournalActivity, completeWorkout, deleteRecord, getRecord, listRecords, saveActivityBatch, saveRecord,
  translateTrainingError,
} from '@/lib/training/store'

type Context = { params: Promise<{ path: string[] }> }
const createBody = z.object({ id: uuid.optional(), data: z.unknown() }).strict()
const updateBody = z.object({ version, data: z.unknown() }).strict()
const completionBody = z.object({ version }).strict()
const journalBody = z.union([
  z.object({
    version, data: journalEntrySchema.extend({
      sessionRpe: z.number().int().min(0).max(10).optional(),
      techniques: z.array(z.object({
        name: z.string().trim().min(1).max(200),
        youtubeUrl: z.string().url().startsWith('https://').nullable().optional(),
        notes: z.string().max(4000).nullable().optional(),
      }).strict()).max(30).optional(),
    }).strict(),
  }).strict(),
  z.object({ version, journalEntryId: uuid }).strict(),
])
const batchBody = z.object({
  items: z.array(z.object({ id: uuid, data: activitySchema }).strict()).min(1).max(100),
}).strict().refine(({ items }) => new Set(items.map(({ id }) => id)).size === items.length, 'Batch contains duplicate IDs')
const pageParams = z.object({
  limit: z.coerce.number().int().min(1).max(100).default(50),
  cursor: z.string().min(1).max(180).optional(),
})
const versionParam = z.string().regex(/^\d+$/).transform(Number).pipe(version)
const MAX_BODY_BYTES = 512 * 1024
const headers = { 'Cache-Control': 'private, no-store' }

function respond(data: unknown, status = 200) {
  return Response.json(data, { status, headers })
}

async function readBody(request: Request) {
  const reader = request.body?.getReader()
  if (!reader) throw new ApiError(400, 'Expected a JSON body')
  const decoder = new TextDecoder('utf-8', { fatal: true })
  let body = ''
  let size = 0
  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      size += value.length
      if (size > MAX_BODY_BYTES) throw new ApiError(413, 'Request body is too large')
      body += decoder.decode(value, { stream: true })
    }
    return JSON.parse(body + decoder.decode())
  } catch (error) {
    if (error instanceof ApiError) throw error
    throw new ApiError(400, 'Invalid JSON body')
  } finally {
    if (size > MAX_BODY_BYTES) await reader.cancel().catch(() => {})
    reader.releaseLock()
  }
}

async function dispatch(request: Request, context: Context) {
  try {
    const user = await getCurrentUser()
    if (!user?.id) return respond({ error: 'Unauthorized' }, 401)
    const [collection, id, action, ...extra] = (await context.params).path
    if (!isTrainingCollection(collection) || extra.length) return respond({ error: 'Training route unavailable' }, 404)
    const url = new URL(request.url)

    if (request.method === 'POST' && collection === 'activities' && id === 'batch' && !action) {
      const body = batchBody.parse(await readBody(request))
      return respond(await saveActivityBatch(user.id, body.items), 201)
    }
    if (id && !uuid.safeParse(id).success) return respond({ error: 'Training record unavailable' }, 404)

    if (action) {
      if (request.method !== 'POST') return respond({ error: 'Method not allowed' }, 405)
      if (collection === 'workouts' && action === 'complete') {
        const body = completionBody.parse(await readBody(request))
        return respond(await completeWorkout(user.id, id, body.version))
      }
      if (collection === 'activities' && action === 'journal') {
        const body = journalBody.parse(await readBody(request))
        return respond(await completeJournalActivity(user.id, id, body.version, body))
      }
      return respond({ error: 'Training route unavailable' }, 404)
    }

    if (request.method === 'GET') {
      if (id) return respond(await getRecord(user.id, collection, id))
      const page = pageParams.parse(Object.fromEntries(url.searchParams))
      return respond(await listRecords(user.id, collection, page.limit, page.cursor))
    }
    if (request.method === 'POST' && !id) {
      const body = createBody.parse(await readBody(request))
      const data = trainingSchemas[collection].parse(body.data)
      return respond(await saveRecord(user.id, collection, data, body.id), 201)
    }
    if (request.method === 'PATCH' && id) {
      const body = updateBody.parse(await readBody(request))
      const data = trainingSchemas[collection].parse(body.data)
      return respond(await saveRecord(user.id, collection, data, id, body.version))
    }
    if (request.method === 'DELETE' && id) {
      await deleteRecord(user.id, collection, id, versionParam.parse(url.searchParams.get('version')))
      return new Response(null, { status: 204, headers })
    }
    return respond({ error: 'Method not allowed' }, 405)
  } catch (originalError) {
    const error = translateTrainingError(originalError)
    if (error instanceof ApiError) return respond({ error: error.message }, error.statusCode)
    if (error instanceof z.ZodError) {
      return respond({ error: error.issues[0]?.message ?? 'Invalid training data' }, 400)
    }
    console.error('Training API request failed')
    return respond({ error: 'Training request failed' }, 500)
  }
}

export const GET = dispatch
export const POST = dispatch
export const PATCH = dispatch
export const DELETE = dispatch
