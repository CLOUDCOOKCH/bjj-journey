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
    const { videos, ...updateData } = reviewTechniqueUpdateSchema.parse(body)
    const { id } = await params

    // Verify ownership
    const existing = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, id),
    })

    if (!existing || existing.userId !== user.id) {
      throw new ApiError(403, 'Technique not found or access denied')
    }

    await db.update(reviewTechniques)
      .set({ ...updateData, updatedAt: new Date() })
      .where(eq(reviewTechniques.id, id))

    // Handle videos update if provided
    if (videos !== undefined) {
      // Delete existing videos
      await db.delete(reviewTechniqueVideos).where(eq(reviewTechniqueVideos.reviewTechniqueId, id))

      // Insert new videos if any
      if (videos.length > 0) {
        const videosToInsert = videos.map((video, index) => ({
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
