/**
 * Test suite for lib/api/client.ts
 * 
 * Tests cover:
 * - GET requests
 * - POST requests
 * - PATCH requests
 * - DELETE requests
 * - Error handling (4xx, 5xx)
 * - Network errors
 * - 204 No Content handling
 */

import { get, post, patch, del } from '@/lib/api/client'

// Mock fetch globally
global.fetch = jest.fn()

describe('API Client', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET requests', () => {
    it('returns parsed JSON on 200 OK', async () => {
      const mockData = { id: '1', name: 'Test Entry' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await get<{ id: string; name: string }>('/api/test')

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
    })

    it('throws error on 404 Not Found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Not found' }),
      })

      await expect(get('/api/test')).rejects.toThrow('Not found')
    })

    it('throws error on 500 Internal Server Error', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Internal server error' }),
      })

      await expect(get('/api/test')).rejects.toThrow('Internal server error')
    })

    it('throws generic error when error object has no error property', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ message: 'Something went wrong' }),
      })

      await expect(get('/api/test')).rejects.toThrow('An unexpected error occurred')
    })
  })

  describe('POST requests', () => {
    it('sends JSON body with correct headers', async () => {
      const mockData = { id: '1', name: 'New Entry' }
      const requestBody = { name: 'Test Entry', notes: 'Test notes' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await post<{ id: string; name: string }>('/api/test', requestBody)

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith('/api/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })
    })

    it('returns parsed JSON on 201 Created', async () => {
      const mockData = { id: '1', created: true }
      const requestBody = { name: 'Test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await post('/api/test', requestBody)

      expect(result).toEqual(mockData)
    })

    it('throws error on 400 Bad Request', async () => {
      const requestBody = { name: 'Test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: async () => ({ error: 'Validation error' }),
      })

      await expect(post('/api/test', requestBody)).rejects.toThrow('Validation error')
    })

    it('throws error on 409 Conflict', async () => {
      const requestBody = { name: 'Test' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 409,
        json: async () => ({ error: 'Resource already exists' }),
      })

      await expect(post('/api/test', requestBody)).rejects.toThrow('Resource already exists')
    })
  })

  describe('PATCH requests', () => {
    it('sends PATCH method correctly', async () => {
      const mockData = { id: '1', name: 'Updated Entry' }
      const requestBody = { notes: 'Updated notes' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await patch<{ id: string; name: string }>('/api/test/1', requestBody)

      expect(result).toEqual(mockData)
      expect(global.fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody),
      })
    })

    it('sends JSON body in request', async () => {
      const requestBody = { name: 'New name', notes: 'New notes' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ success: true }),
      })

      await patch('/api/test/1', requestBody)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      expect(fetchCall[1].body).toBe(JSON.stringify(requestBody))
    })

    it('throws error on 404 Not Found', async () => {
      const requestBody = { notes: 'Updated' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Entry not found' }),
      })

      await expect(patch('/api/test/1', requestBody)).rejects.toThrow('Entry not found')
    })

    it('throws error on 403 Forbidden', async () => {
      const requestBody = { notes: 'Updated' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      })

      await expect(patch('/api/test/1', requestBody)).rejects.toThrow('Access denied')
    })

    it('returns parsed JSON on successful update', async () => {
      const mockData = { id: '1', notes: 'Updated notes' }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockData,
      })

      const result = await patch('/api/test/1', { notes: 'Updated notes' })

      expect(result).toEqual(mockData)
    })
  })

  describe('DELETE requests', () => {
    it('returns undefined on 204 No Content', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 204,
      })

      const result = await del('/api/test/1')

      expect(result).toBeUndefined()
      expect(global.fetch).toHaveBeenCalledWith('/api/test/1', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      })
    })

    it('throws error on 403 Forbidden', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ error: 'Access denied' }),
      })

      await expect(del('/api/test/1')).rejects.toThrow('Access denied')
    })

    it('throws error on 404 Not Found', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ error: 'Entry not found' }),
      })

      await expect(del('/api/test/1')).rejects.toThrow('Entry not found')
    })

    it('returns parsed JSON when not 204 status', async () => {
      const mockData = { success: true }
      ;(global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockData,
      })

      const result = await del('/api/test/1')

      expect(result).toEqual(mockData)
    })
  })

  describe('Network errors', () => {
    it('network errors are caught and re-thrown', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'))

      await expect(get('/api/test')).rejects.toThrow('Network error')
    })

    it('handles timeout errors', async () => {
      ;(global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Request timeout'))

      await expect(post('/api/test', {})).rejects.toThrow('Request timeout')
    })
  })

  describe('Headers and credentials', () => {
    it('all methods include Content-Type header', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await get('/api/test')
      await post('/api/test', {})
      await patch('/api/test', {})
      await del('/api/test')

      const calls = (global.fetch as jest.Mock).mock.calls
      calls.forEach(call => {
        expect(call[1].headers['Content-Type']).toBe('application/json')
      })
    })

    it('all methods include credentials header', async () => {
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({}),
      })

      await get('/api/test')
      await post('/api/test', {})
      await patch('/api/test', {})
      await del('/api/test')

      const calls = (global.fetch as jest.Mock).mock.calls
      calls.forEach(call => {
        expect(call[1].credentials).toBe('include')
      })
    })
  })

  describe('Body serialization', () => {
    it('serializes complex objects correctly', async () => {
      const complexBody = {
        name: 'Test',
        nested: {
          value: 123,
          array: ['a', 'b', 'c']
        },
        date: '2024-01-15'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await post('/api/test', complexBody)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      expect(JSON.parse(fetchCall[1].body)).toEqual(complexBody)
    })

    it('handles special characters in body', async () => {
      const specialBody = {
        notes: 'Special characters: "quotes", \'apostrophes\', & symbols',
        emoji: '🥋🤼'
      }
      ;(global.fetch as jest.Mock).mockResolvedValue({
        ok: true,
        json: async () => ({ success: true }),
      })

      await post('/api/test', specialBody)

      const fetchCall = (global.fetch as jest.Mock).mock.calls[0]
      expect(JSON.parse(fetchCall[1].body)).toEqual(specialBody)
    })
  })
})
