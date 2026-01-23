import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { journalEntries } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { journalEntrySchema } from '@/lib/validations/schema'
import { handleApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const user = await requireAuth()

    const entries = await db.query.journalEntries.findMany({
      where: eq(journalEntries.userId, user.id!),
      with: {
        techniques: true,
      },
      orderBy: [desc(journalEntries.entryDate)],
    })

    return NextResponse.json(entries)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = journalEntrySchema.parse(body)

    const entry = await db.insert(journalEntries).values({
      userId: user.id!,
      entryDate: data.entryDate,
      notes: data.notes,
    }).returning()

    return NextResponse.json(entry[0], { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
