import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { profiles, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { profileUpdateSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

export async function GET() {
  try {
    const user = await requireAuth()

    const profile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id!),
      with: {
        user: true
      }
    })

    if (!profile) {
      // Create default profile if it doesn't exist
      const newProfile = await db.insert(profiles).values({
        id: user.id!,
        belt: 'white',
        monthlyGoal: 12,
      }).returning()

      // Fetch the created profile with user data
      const createdProfile = await db.query.profiles.findFirst({
        where: eq(profiles.id, user.id!),
        with: {
          user: true
        }
      })

      return NextResponse.json(createdProfile)
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
    const { name, ...profileData } = profileUpdateSchema.parse(body)

    // Update user name if provided
    if (name) {
      await db.update(users)
        .set({
          name,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id!))
    }

    // Update profile data if generic profile fields are provided
    if (Object.keys(profileData).length > 0) {
      await db.update(profiles)
        .set({
          ...profileData,
          updatedAt: new Date(),
        })
        .where(eq(profiles.id, user.id!))
        .returning()
    }

    // Return the full updated profile with user data
    const updatedProfile = await db.query.profiles.findFirst({
      where: eq(profiles.id, user.id!),
      with: {
        user: true
      }
    })

    if (!updatedProfile) {
      throw new ApiError(404, 'Profile not found')
    }

    return NextResponse.json(updatedProfile)
  } catch (error) {
    return handleApiError(error)
  }
}
