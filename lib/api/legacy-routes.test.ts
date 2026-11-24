/** @jest-environment node */

import { PgDialect } from 'drizzle-orm/pg-core'
import { getServerSession } from 'next-auth'
import { NextRequest } from 'next/server'
import { GET as getJournalEntry } from '@/app/api/journal-entries/[id]/route'
import { POST as createJournalEntry } from '@/app/api/journal-entries/route'
import { GET as getReviewTechniques } from '@/app/api/review-techniques/route'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { db } from '@/lib/db'

jest.mock('next-auth', () => ({ getServerSession: jest.fn() }))
jest.mock('@/lib/auth', () => ({ authOptions: {} }))
jest.mock('@/lib/db', () => ({
  db: {
    insert: jest.fn(),
    query: {
      journalEntries: { findFirst: jest.fn() },
      reviewTechniques: { findMany: jest.fn() },
    },
  },
}))

const userId = 'c2fa1cf4-906d-43d9-9a41-ed6d5e8f1e94'
const entryId = 'ad0c7556-de79-4f93-862a-0ba673a8eabd'
const mockSession = jest.mocked(getServerSession)
const mockJournalLookup = jest.mocked(db.query.journalEntries.findFirst)
const mockTechniquesLookup = jest.mocked(db.query.reviewTechniques.findMany)

beforeEach(() => {
  jest.resetAllMocks()
  mockSession.mockResolvedValue({ user: { id: userId } })
})

test('rejects an anonymous journal request before querying the database', async () => {
  mockSession.mockResolvedValue(null)
  const response = await getJournalEntry(new NextRequest('http://localhost/api/journal-entries/' + entryId), {
    params: Promise.resolve({ id: entryId }),
  })

  expect(response.status).toBe(401)
  expect(await response.json()).toEqual({ error: 'Unauthorized' })
  expect(mockJournalLookup).not.toHaveBeenCalled()
})

test('filters the journal entry lookup by both resource ID and session user', async () => {
  const response = await getJournalEntry(new NextRequest('http://localhost/api/journal-entries/' + entryId), {
    params: Promise.resolve({ id: entryId }),
  })

  const filters = mockJournalLookup.mock.calls[0]?.[0]?.where
  if (!filters || typeof filters === 'function') throw new Error('Expected a journal ownership predicate')
  expect(new PgDialect().sqlToQuery(filters).params).toEqual([entryId, userId])
  expect(response.status).toBe(404)
})

test('rejects impossible journal dates without inserting a row', async () => {
  const response = await createJournalEntry(new NextRequest('http://localhost/api/journal-entries', {
    method: 'POST',
    body: JSON.stringify({ entryDate: '2025-02-29', sessionType: 'gi', durationMinutes: 90 }),
  }))

  expect(response.status).toBe(400)
  expect(await response.json()).toEqual({ error: 'Invalid date (e.g., February 30 is not valid)' })
  expect(db.insert).not.toHaveBeenCalled()
})

test('applies owner, category, and favourite predicates to the personal technique collection', async () => {
  mockTechniquesLookup.mockResolvedValue([])
  const response = await getReviewTechniques(new NextRequest('http://localhost/api/review-techniques?category=guard&favorites=true'))

  const filters = mockTechniquesLookup.mock.calls[0]?.[0]?.where
  if (!filters || typeof filters === 'function') throw new Error('Expected a technique ownership predicate')
  expect(new PgDialect().sqlToQuery(filters).params).toEqual([userId, 'guard', true])
  expect(response.status).toBe(200)
  expect(await response.json()).toEqual([])
})

test('keeps unexpected errors out of response bodies', async () => {
  const logging = jest.spyOn(console, 'error').mockImplementation(() => {})
  try {
    const failure = handleApiError(new Error('Private database information'))
    const conflict = handleApiError(new ApiError(409, 'Already completed'))
    expect(failure.status).toBe(500)
    expect(await failure.json()).toEqual({ error: 'Internal server error' })
    expect(logging).toHaveBeenCalledWith('Unhandled API error', 'Error')
    expect(conflict.status).toBe(409)
    expect(await conflict.json()).toEqual({ error: 'Already completed' })
  } finally {
    logging.mockRestore()
  }
})
