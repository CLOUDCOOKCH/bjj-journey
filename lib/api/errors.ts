import { ZodError } from 'zod'

export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export function handleApiError(error: unknown) {
  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof ZodError) {
    return Response.json(
      { error: error.issues[0]?.message || 'Invalid request data' },
      { status: 400 }
    )
  }

  console.error('Unhandled API error', error instanceof Error ? error.name : typeof error)
  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
