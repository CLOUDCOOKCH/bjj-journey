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
  console.error('API Error:', error)

  if (error instanceof ApiError) {
    return Response.json(
      { error: error.message },
      { status: error.statusCode }
    )
  }

  if (error instanceof Error) {
    // Zod validation errors
    if (error.name === 'ZodError') {
      // Parse Zod error to get the actual validation messages
      try {
        const zodError = JSON.parse(error.message)
        const firstError = zodError.issues?.[0]
        const errorMessage = firstError?.message || 'Invalid request data'
        return Response.json(
          { error: errorMessage },
          { status: 400 }
        )
      } catch {
        return Response.json(
          { error: 'Invalid request data' },
          { status: 400 }
        )
      }
    }
  }

  return Response.json(
    { error: 'Internal server error' },
    { status: 500 }
  )
}
