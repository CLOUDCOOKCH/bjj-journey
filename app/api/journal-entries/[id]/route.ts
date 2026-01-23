import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { journalEntries } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { journalEntryUpdateSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const entry = await db.query.journalEntries.findFirst({
      where: and(
        eq(journalEntries.id, id),
        eq(journalEntries.userId, user.id!)
      ),
      with: {
        techniques: true,
      },
    })

    if (!entry) {
      throw new ApiError(404, 'Entry not found')
    }

    return NextResponse.json(entry)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    console.log('PATCH journal entry ID:', id, 'user:', user.id)
    const data = journalEntryUpdateSchema.parse(body)

    const updated = await db.update(journalEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, user.id!)
        )
      )
      .returning()

    if (!updated[0]) {
      console.log('Entry not found for ID:', id, 'user:', user.id)
      throw new ApiError(404, 'Entry not found')
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params
    const body = await request.json()
    const data = journalEntryUpdateSchema.parse(body)

    const updated = await db.update(journalEntries)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, user.id!)
        )
      )
      .returning()

    if (!updated[0]) {
      throw new ApiError(404, 'Entry not found')
    }

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

    const deleted = await db.delete(journalEntries)
      .where(
        and(
          eq(journalEntries.id, id),
          eq(journalEntries.userId, user.id!)
        )
      )
      .returning()

    if (!deleted[0]) {
      throw new ApiError(404, 'Entry not found')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
