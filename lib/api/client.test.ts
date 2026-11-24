/** @jest-environment node */

import { del, get, patch, post } from './client'

afterEach(() => jest.restoreAllMocks())

test('includes authentication cookies and sends JSON for writes', async () => {
  const endpoint = '/api/test'
  const fetch = jest.spyOn(globalThis, 'fetch')
    .mockImplementation(async () => Response.json({ accepted: true }))

  await expect(get(endpoint)).resolves.toEqual({ accepted: true })
  await expect(post(endpoint, { title: 'Guard session' })).resolves.toEqual({ accepted: true })
  await expect(patch(endpoint, false)).resolves.toEqual({ accepted: true })

  const request = { headers: { 'Content-Type': 'application/json' }, credentials: 'include' }
  expect(fetch).toHaveBeenNthCalledWith(1, endpoint, { ...request, method: 'GET' })
  expect(fetch).toHaveBeenNthCalledWith(2, endpoint, { ...request, method: 'POST', body: '{"title":"Guard session"}' })
  expect(fetch).toHaveBeenNthCalledWith(3, endpoint, { ...request, method: 'PATCH', body: 'false' })
})

test('handles a no-content delete response', async () => {
  const fetch = jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(null, { status: 204 }))
  await expect(del('/api/test')).resolves.toBeUndefined()
  expect(fetch).toHaveBeenCalledWith('/api/test', expect.objectContaining({ method: 'DELETE' }))
})

test.each([
  ['{"error":"Unauthorized"}', 'Unauthorized'],
  ['{"error":null}', 'An unexpected error occurred'],
  ['{}', 'An unexpected error occurred'],
  ['null', 'An unexpected error occurred'],
  ['<html>Bad gateway</html>', 'An unexpected error occurred'],
])('normalizes failed HTTP response %s', async (body, error) => {
  jest.spyOn(globalThis, 'fetch').mockResolvedValue(new Response(body, { status: 500 }))
  await expect(get('/api/test')).rejects.toThrow(error)
})
