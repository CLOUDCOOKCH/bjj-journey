import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { techniques, journalEntries } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { techniqueUpdateSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = techniqueUpdateSchema.parse(body)
    const { id } = await params

    // Verify the technique belongs to a journal entry owned by the user
    const technique = await db.query.techniques.findFirst({
      where: eq(techniques.id, id),
      with: {
        journalEntry: true,
      },
    })

    if (!technique || technique.journalEntry.userId !== user.id) {
      throw new ApiError(403, 'Technique not found or access denied')
    }

    const updated = await db.update(techniques)
      .set(data)
      .where(eq(techniques.id, id))
      .returning()

    return NextResponse.json(updated[0])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify the technique belongs to a journal entry owned by the user
    const technique = await db.query.techniques.findFirst({
      where: eq(techniques.id, id),
      with: {
        journalEntry: true,
      },
    })

    if (!technique || technique.journalEntry.userId !== user.id) {
      throw new ApiError(403, 'Technique not found or access denied')
    }

    await db.delete(techniques).where(eq(techniques.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
