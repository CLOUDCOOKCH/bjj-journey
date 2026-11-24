/** @jest-environment node */

import bcrypt from 'bcrypt'
import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { DELETE } from './route'
import { GET } from './export/route'

jest.mock('bcrypt', () => ({ compare: jest.fn() }))
jest.mock('@/lib/api/auth', () => ({ getCurrentUser: jest.fn() }))
jest.mock('@/lib/db', () => ({ db: { select: jest.fn(), execute: jest.fn() } }))

const owner = 'ffaa407b-0810-435e-8abb-dbc141007ecd'
const mockDb = db as unknown as {
  select: jest.Mock
  execute: jest.Mock
}
const compare = bcrypt.compare as unknown as jest.Mock

function deleteRequest(password: unknown) {
  return new NextRequest('http://localhost/api/account', {
    method: 'DELETE',
    headers: { 'content-type': 'application/json', cookie: 'next-auth.session-token=test; next-auth.session-token.1=part; ui-theme=dark' },
    body: JSON.stringify({ password }),
  })
}

beforeEach(() => {
  jest.resetAllMocks()
  jest.mocked(getCurrentUser).mockResolvedValue({ id: owner })
  mockDb.select.mockReturnValue({ from: () => ({ where: () => [{ password: 'saved-hash' }] }) })
})

test('anonymous callers cannot export or delete account data', async () => {
  jest.mocked(getCurrentUser).mockResolvedValue(null)
  expect((await GET()).status).toBe(401)
  expect((await DELETE(deleteRequest('password'))).status).toBe(401)
  expect(mockDb.execute).not.toHaveBeenCalled()
  expect(mockDb.select).not.toHaveBeenCalled()
})

test('export is an uncached JSON attachment', async () => {
  const data = { formatVersion: 1, account: { id: owner }, training: [] }
  mockDb.execute.mockResolvedValue({ rows: [{ contents: data }] })
  const response = await GET()
  expect(response.status).toBe(200)
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  expect(response.headers.get('content-disposition')).toBe('attachment; filename="bjj-journey-export.json"')
  expect(await response.json()).toEqual(data)
})

test('incorrect credentials prevent account deletion', async () => {
  compare.mockResolvedValue(false)
  expect((await DELETE(deleteRequest('incorrect'))).status).toBe(403)
  expect(compare).toHaveBeenCalledWith('incorrect', 'saved-hash')
  expect(mockDb.execute).not.toHaveBeenCalled()
})

test('confirmed deletion clears all NextAuth session cookie chunks', async () => {
  compare.mockResolvedValue(true)
  mockDb.execute.mockResolvedValue({ rows: [{ deleted: true }] })
  const response = await DELETE(deleteRequest('confirmed'))
  expect(response.status).toBe(204)
  expect(response.headers.get('cache-control')).toBe('private, no-store')
  const cookies = response.headers.getSetCookie()
  expect(cookies.some((cookie) => cookie.startsWith('next-auth.session-token=;'))).toBe(true)
  expect(cookies.some((cookie) => cookie.startsWith('next-auth.session-token.1=;'))).toBe(true)
  expect(cookies.some((cookie) => cookie.startsWith('ui-theme='))).toBe(false)
})
