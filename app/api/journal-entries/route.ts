import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { journalEntries } from '@/lib/db/schema'
import { eq, desc, asc, sql } from 'drizzle-orm'
import { journalEntrySchema } from '@/lib/validations/schema'
import { ApiError, handleApiError } from '@/lib/api/errors'

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const searchParams = request.nextUrl.searchParams

    const limit = Math.min(Number(searchParams.get('limit') || '20'), 100)
    const offset = Number(searchParams.get('offset') || '0')
    const sort = searchParams.get('sort') || 'latest'
    if (!Number.isSafeInteger(limit) || limit < 1 || !Number.isSafeInteger(offset) || offset < 0) {
      throw new ApiError(400, 'Invalid journal pagination')
    }

    let orderBy
    switch (sort) {
      case 'oldest':
        orderBy = [asc(journalEntries.entryDate)]
        break
      case 'duration':
        orderBy = [desc(journalEntries.durationMinutes), desc(journalEntries.entryDate)]
        break
      case 'intensity':
        orderBy = [desc(journalEntries.intensityLevel), desc(journalEntries.entryDate)]
        break
      case 'latest':
      default:
        orderBy = [desc(journalEntries.entryDate)]
        break
    }

    const entries = await db.query.journalEntries.findMany({
      where: eq(journalEntries.userId, user.id!),
      with: {
        techniques: true,
      },
      orderBy: [...orderBy, asc(journalEntries.id)],
      limit,
      offset,
    })

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)` })
      .from(journalEntries)
      .where(eq(journalEntries.userId, user.id!))

    const total = Number(count)
    const hasMore = offset + entries.length < total

    return NextResponse.json({
      entries,
      total,
      hasMore,
    })
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
      sessionType: data.sessionType,
      title: data.title || null,
      focusAreas: data.focusAreas || null,
      intensityLevel: data.intensityLevel || null,
      sessionRpe: data.sessionRpe ?? null,
      durationMinutes: data.durationMinutes,
      notes: data.notes,
    }).returning()

    return NextResponse.json(entry[0], { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
