import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { achievements } from '@/lib/db/schema'
import { eq, and } from 'drizzle-orm'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const deleted = await db.delete(achievements)
      .where(
        and(
          eq(achievements.id, id),
          eq(achievements.userId, user.id!)
        )
      )
      .returning()

    if (!deleted[0]) {
      throw new ApiError(404, 'Achievement not found')
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
