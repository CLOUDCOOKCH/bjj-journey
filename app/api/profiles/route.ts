import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { profiles } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { profileUpdateSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id!),
    })

    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await db.insert(profiles).values({
        id: user.id!,
        belt: 'white',
        monthlyGoal: 12,
      }).returning()

      return NextResponse.json(newProfile[0])
    }

    return NextResponse.json(profile)
  } catch (error) {
    return handleApiError(error)
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = profileUpdateSchema.parse(body)

    const updated = await db.update(profiles)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, user.id!))
      .returning()

    if (!updated[0]) {
      throw new ApiError(404, 'Profile not found')
    }

    return NextResponse.json(updated[0])
  } catch (error) {
    return handleApiError(error)
  }
}
