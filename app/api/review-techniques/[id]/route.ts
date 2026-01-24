import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { reviewTechniques, reviewTechniqueVideos } from '@/lib/db/schema'
import { eq, asc } from 'drizzle-orm'
import { reviewTechniqueUpdateSchema } from '@/lib/validations/schema'
import { handleApiError, ApiError } from '@/lib/api/errors'

// GET /api/review-techniques/:id
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    const technique = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, id),
      with: {
        videos: {
          orderBy: asc(reviewTechniqueVideos.orderIndex),
        },
      },
    })

    if (!technique || technique.userId !== user.id) {
      throw new ApiError(404, 'Technique not found')
    }

    // Increment view count and update last reviewed
    await db.update(reviewTechniques)
      .set({
        viewCount: technique.viewCount + 1,
        lastReviewed: new Date(),
      })
      .where(eq(reviewTechniques.id, id))

    return NextResponse.json({
      ...technique,
      viewCount: technique.viewCount + 1,
      lastReviewed: new Date(),
    })
  } catch (error) {
    return handleApiError(error)
  }
}

// PATCH /api/review-techniques/:id
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = reviewTechniqueUpdateSchema.parse(body)
    const { id } = await params

    // Verify ownership
    const existing = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, id),
    })

    if (!existing || existing.userId !== user.id) {
      throw new ApiError(403, 'Technique not found or access denied')
    }

    // Filter out undefined values
    const updateData: Record<string, any> = {}
    if (data.name !== undefined) updateData.name = data.name
    if (data.description !== undefined) updateData.description = data.description
    if (data.category !== undefined) updateData.category = data.category
    if (data.beltLevel !== undefined) updateData.beltLevel = data.beltLevel
    if (data.difficulty !== undefined) updateData.difficulty = data.difficulty
    if (data.trainingType !== undefined) updateData.trainingType = data.trainingType
    if (data.notes !== undefined) updateData.notes = data.notes
    if (data.isFavorite !== undefined) updateData.isFavorite = data.isFavorite

    const updated = await db.update(reviewTechniques)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(reviewTechniques.id, id))
      .returning()

    // Handle videos update if provided
    if (data.videos !== undefined) {
      // Delete existing videos
      await db.delete(reviewTechniqueVideos).where(eq(reviewTechniqueVideos.reviewTechniqueId, id))

      // Insert new videos if any
      if (data.videos.length > 0) {
        const videosToInsert = data.videos.map((video, index) => ({
          reviewTechniqueId: id,
          youtubeUrl: video.youtubeUrl,
          title: video.title || null,
          orderIndex: index,
        }))
        await db.insert(reviewTechniqueVideos).values(videosToInsert)
      }
    }

    // Fetch the complete technique with videos
    const completeTechnique = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, id),
      with: {
        videos: {
          orderBy: asc(reviewTechniqueVideos.orderIndex),
        },
      },
    })

    return NextResponse.json(completeTechnique)
  } catch (error) {
    return handleApiError(error)
  }
}

// DELETE /api/review-techniques/:id
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth()
    const { id } = await params

    // Verify ownership
    const existing = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, id),
    })

    if (!existing || existing.userId !== user.id) {
      throw new ApiError(403, 'Technique not found or access denied')
    }

    await db.delete(reviewTechniques).where(eq(reviewTechniques.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    return handleApiError(error)
  }
}
