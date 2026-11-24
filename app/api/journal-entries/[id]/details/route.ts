import { NextRequest, NextResponse } from 'next/server'
import { and, eq, sql } from 'drizzle-orm'
import { z } from 'zod'
import { requireAuth } from '@/lib/api/auth'
import { ApiError, handleApiError } from '@/lib/api/errors'
import { db } from '@/lib/db'
import { journalEntries, journalTechniqueLinks } from '@/lib/db/schema'
import { journalDetailsSchema } from '@/lib/validations/journal-details'

type RouteParams = { params: Promise<{ id: string }> }

async function getDetails(owner: string, id: string) {
  const rows = await db.select({
    title: journalEntries.title,
    entryDate: journalEntries.entryDate,
    sessionRpe: journalEntries.sessionRpe,
    details: journalEntries.trainingDetails,
    techniqueId: journalTechniqueLinks.reviewTechniqueId,
  }).from(journalEntries).leftJoin(journalTechniqueLinks, and(
    eq(journalTechniqueLinks.journalEntryId, journalEntries.id),
    eq(journalTechniqueLinks.ownerId, journalEntries.userId),
  )).where(and(eq(journalEntries.userId, owner), eq(journalEntries.id, id)))

  const first = rows[0]
  if (!first) throw new ApiError(404, 'Journal entry not found')
  return {
    title: first.title,
    entryDate: first.entryDate,
    sessionRpe: first.sessionRpe,
    details: first.details ?? {},
    techniqueIds: rows.flatMap(row => row.techniqueId ? [row.techniqueId] : []),
  }
}

export async function GET(_request: NextRequest, { params }: RouteParams) {
  try {
    const { id: owner } = await requireAuth()
    const id = z.string().uuid().parse((await params).id)
    return NextResponse.json(await getDetails(owner, id), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest, { params }: RouteParams) {
  try {
    const { id: owner } = await requireAuth()
    const id = z.string().uuid().parse((await params).id)
    const data = journalDetailsSchema.parse(await request.json().catch(() => {
      throw new ApiError(400, 'Invalid JSON')
    }))
    const techniqueIds = `{${data.techniqueIds.join(',')}}`
    const result = await db.execute<{ saved: boolean | null }>(sql`
      SELECT public.save_journal_training_details(
        ${owner}::uuid, ${id}::uuid, ${data.sessionRpe}::integer,
        ${JSON.stringify(data.details)}::jsonb, ${techniqueIds}::uuid[]
      ) AS saved
    `)
    const saved = result.rows[0]?.saved
    if (saved === null) throw new ApiError(404, 'Journal entry not found')
    if (!saved) throw new ApiError(400, 'One or more selected techniques are unavailable')
    return NextResponse.json(await getDetails(owner, id), { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    return handleApiError(error)
  }
}
