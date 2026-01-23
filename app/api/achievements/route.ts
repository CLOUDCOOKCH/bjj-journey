import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { achievements } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { achievementSchema } from '@/lib/validations/schema'
import { handleApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const user = await requireAuth()

    const userAchievements = await db.query.achievements.findMany({
      where: eq(achievements.userId, user.id!),
      orderBy: [desc(achievements.achievedDate)],
    })

    return NextResponse.json(userAchievements)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = achievementSchema.parse(body)

    const achievement = await db.insert(achievements).values({
      userId: user.id!,
      type: data.type,
      title: data.title,
      description: data.description,
      achievedDate: data.achievedDate,
    }).returning()

    return NextResponse.json(achievement[0], { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
