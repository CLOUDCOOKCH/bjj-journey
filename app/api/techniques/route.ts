import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { techniques, journalEntries } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { techniqueSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = techniqueSchema.parse(body)

    // Verify the journal entry belongs to the user
    const entry = await db.query.journalEntries.findFirst({
      where: eq(journalEntries.id, data.journalEntryId),
    })

    if (!entry || entry.userId !== user.id) {
      throw new ApiError(403, 'Journal entry not found or access denied')
    }

    const technique = await db.insert(techniques).values({
      journalEntryId: data.journalEntryId,
      name: data.name,
      youtubeUrl: data.youtubeUrl,
      notes: data.notes,
    }).returning()

    return NextResponse.json(technique[0], { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
