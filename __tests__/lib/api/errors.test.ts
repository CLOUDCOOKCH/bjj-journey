/**
 * Test suite for lib/api/errors.ts
 * 
 * Tests cover:
 * - ApiError class instantiation and properties
 * - handleApiError function for various error types
 * - Console error logging
 * - Response structure and status codes
 */

import { ApiError, handleApiError } from '@/lib/api/errors'
import { ZodError } from 'zod'

describe('ApiError class', () => {
  it('creates error with statusCode and message', () => {
    const error = new ApiError(404, 'Not found')

    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(ApiError)
    expect(error.statusCode).toBe(404)
    expect(error.message).toBe('Not found')
  })

  it('error name property is ApiError', () => {
    const error = new ApiError(500, 'Server error')

    expect(error.name).toBe('ApiError')
  })

  it('can be thrown and caught', () => {
    const error = new ApiError(401, 'Unauthorized')

    expect(() => {
      throw error
    }).toThrow('Unauthorized')
  })

  it('preserves stack trace', () => {
    const error = new ApiError(403, 'Forbidden')

    expect(error.stack).toBeDefined()
    expect(typeof error.stack).toBe('string')
  })

  it('works with different status codes', () => {
    const error400 = new ApiError(400, 'Bad Request')
    const error401 = new ApiError(401, 'Unauthorized')
    const error403 = new ApiError(403, 'Forbidden')
    const error404 = new ApiError(404, 'Not Found')
    const error500 = new ApiError(500, 'Internal Server Error')

    expect(error400.statusCode).toBe(400)
    expect(error401.statusCode).toBe(401)
    expect(error403.statusCode).toBe(403)
    expect(error404.statusCode).toBe(404)
    expect(error500.statusCode).toBe(500)
  })
})

describe('handleApiError function', () => {
  let consoleErrorSpy: jest.SpyInstance

  beforeEach(() => {
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation()
  })

  afterEach(() => {
    consoleErrorSpy.mockRestore()
  })

  it('handles ApiError and returns correct response', () => {
    const error = new ApiError(404, 'Not found')
    const response = handleApiError(error)

    expect(response).toBeInstanceOf(Response)
    expect(response.status).toBe(404)
  })

  it('ApiError response body contains error message', async () => {
    const error = new ApiError(404, 'Not found')
    const response = handleApiError(error)
    const body = await response.json()

    expect(body).toEqual({ error: 'Not found' })
  })

  it('handles ZodError and returns 400 status', () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number'
      }
    ])
    const response = handleApiError(zodError)

    expect(response.status).toBe(400)
  })

  it('ZodError response body contains error message and details', async () => {
    const zodError = new ZodError([
      {
        code: 'invalid_type',
        expected: 'string',
        received: 'number',
        path: ['email'],
        message: 'Expected string, received number'
      }
    ])
    Object.defineProperty(zodError, 'name', { value: 'ZodError' })
    const response = handleApiError(zodError)
    const body = await response.json()

    expect(body.error).toBe('Invalid request data')
    expect(body.error).toBeDefined()
  })

  it('handles generic Error and returns 500 status', () => {
    const error = new Error('Something went wrong')
    const response = handleApiError(error)

    expect(response.status).toBe(500)
  })

  it('generic Error response body contains internal server error message', async () => {
    const error = new Error('Something went wrong')
    const response = handleApiError(error)
    const body = await response.json()

    expect(body).toEqual({ error: 'Internal server error' })
  })

  it('handles unknown error type and returns 500 status', () => {
    const unknownError = { random: 'object' }
    const response = handleApiError(unknownError)

    expect(response.status).toBe(500)
  })

  it('unknown error response body contains internal server error message', async () => {
    const unknownError = { random: 'object' }
    const response = handleApiError(unknownError)
    const body = await response.json()

    expect(body).toEqual({ error: 'Internal server error' })
  })

  it('handles null error and returns 500 status', () => {
    const response = handleApiError(null as any)

    expect(response.status).toBe(500)
  })

  it('handles undefined error and returns 500 status', () => {
    const response = handleApiError(undefined as any)

    expect(response.status).toBe(500)
  })

  it('logs error to console for ApiError', () => {
    const error = new ApiError(404, 'Not found')
    handleApiError(error)

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', error)
  })

  it('logs error to console for ZodError', () => {
    const zodError = new ZodError([])
    handleApiError(zodError)

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', zodError)
  })

  it('logs error to console for generic Error', () => {
    const error = new Error('Test error')
    handleApiError(error)

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', error)
  })

  it('logs error to console for unknown error type', () => {
    const unknownError = { random: 'object' }
    handleApiError(unknownError)

    expect(consoleErrorSpy).toHaveBeenCalledWith('API Error:', unknownError)
  })

  it('returns JSON response with correct Content-Type header', async () => {
    const error = new ApiError(404, 'Not found')
    const response = handleApiError(error)

    expect(response.headers.get('content-type')).toBe('application/json')
  })

  it('ApiError with 401 Unauthorized returns correct status', () => {
    const error = new ApiError(401, 'Unauthorized')
    const response = handleApiError(error)

    expect(response.status).toBe(401)
  })

  it('ApiError with 403 Forbidden returns correct status', () => {
    const error = new ApiError(403, 'Forbidden')
    const response = handleApiError(error)

    expect(response.status).toBe(403)
  })

  it('ApiError with 409 Conflict returns correct status', () => {
    const error = new ApiError(409, 'Conflict')
    const response = handleApiError(error)

    expect(response.status).toBe(409)
  })

  it('ApiError with 422 Unprocessable Entity returns correct status', () => {
    const error = new ApiError(422, 'Unprocessable Entity')
    const response = handleApiError(error)

    expect(response.status).toBe(422)
  })

  it('ApiError with custom status code returns that status', () => {
    const error = new ApiError(418, "I'm a teapot")
    const response = handleApiError(error)

    expect(response.status).toBe(418)
  })
})
