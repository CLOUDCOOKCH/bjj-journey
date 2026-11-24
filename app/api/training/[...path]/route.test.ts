/** @jest-environment node */

import { ApiError } from '@/lib/api/errors'
import { getCurrentUser } from '@/lib/api/auth'
import { completeWorkout, saveRecord, listRecords } from '@/lib/training/store'
import { GET, POST, PATCH } from './route'

jest.mock('@/lib/api/auth', () => ({ getCurrentUser: jest.fn() }))
jest.mock('@/lib/training/store', () => ({
  saveRecord: jest.fn(),
  listRecords: jest.fn(),
  completeWorkout: jest.fn(),
  translateTrainingError: (error: unknown) => error,
}))

const owner = '22fb317e-2543-496b-8f52-10f19ed21645'
const record = '83ea948e-df1d-48df-bc69-c7b60d56e04c'
const context = (...path: string[]) => ({ params: Promise.resolve({ path }) })
function request(method: string, path: string, data?: unknown) {
  return new Request(`http://localhost/api/training/${path}`, { method, body: data === undefined ? undefined : JSON.stringify(data) })
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getCurrentUser).mockResolvedValue({ id: owner })
})

test('rejects anonymous training requests and prevents shared caching', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null)
  const response = await GET(request('GET', 'recovery'), context('recovery'))
  expect(response.status).toBe(401)
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  expect(listRecords).not.toHaveBeenCalled()
})

test('derives ownership from the session and bounds collection pages', async () => {
  jest.mocked(listRecords).mockResolvedValue({ items: [], nextCursor: null })
  const response = await GET(request('GET', 'recovery?limit=10&owner=ignored'), context('recovery'))
  expect(response.status).toBe(200)
  expect(listRecords).toHaveBeenCalledWith(owner, 'recovery', 10, undefined)
  expect((await GET(request('GET', 'recovery?limit=1000'), context('recovery'))).status).toBe(400)
})

test('rejects unevaluated mass-assignment fields and invalid measurements', async () => {
  const create = (data: unknown) => POST(request('POST', 'recovery', data), context('recovery'))
  expect((await create({ data: { userId: 'untrusted', date: '2026-11-24', sleepHours: 8 } })).status).toBe(400)
  expect((await create({ data: { date: '2026-11-24', sleepHours: 30 } })).status).toBe(400)
  expect(saveRecord).not.toHaveBeenCalled()
})

test('passes validated data and the expected version to the owner-scoped store', async () => {
  const data = { date: '2026-11-24', sleepHours: 7 }
  jest.mocked(saveRecord).mockResolvedValue({ id: record, version: 3, data, createdAt: '', updatedAt: '' })
  const response = await PATCH(request('PATCH', `recovery/${record}`, { version: 2, data }), context('recovery', record))
  expect(response.status).toBe(200)
  expect(saveRecord).toHaveBeenCalledWith(owner, 'recovery', data, record, 2)
})

test('returns a safe unavailable response when completion is outside the owner scope', async () => {
  jest.mocked(completeWorkout).mockRejectedValue(new ApiError(404, 'Workout unavailable'))
  const response = await POST(request('POST', `workouts/${record}/complete`, { version: 2 }), context('workouts', record, 'complete'))
  expect(await response.json()).toEqual({ error: 'Workout unavailable' })
  expect(response.status).toBe(404)
  expect(completeWorkout).toHaveBeenCalledWith(owner, record, 2)
})
