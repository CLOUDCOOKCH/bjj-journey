import { NextRequest, NextResponse } from 'next/server'
import { requireAuth } from '@/lib/api/auth'
import { db } from '@/lib/db'
import { reviewTechniques, reviewTechniqueVideos } from '@/lib/db/schema'
import { desc, asc, eq, and, or, like, sql } from 'drizzle-orm'
import { reviewTechniqueSchema } from '@/lib/validations/schema'
import { handleApiError } from '@/lib/api/errors'

// GET /api/review-techniques?category=guard&beltLevel=white&sort=recent
export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth()
    const { searchParams } = new URL(request.url)

    const category = searchParams.get('category')
    const beltLevel = searchParams.get('beltLevel')
    const difficulty = searchParams.get('difficulty')
    const trainingType = searchParams.get('trainingType')
    const search = searchParams.get('search')
    const sort = searchParams.get('sort') || 'recent'
    const favoritesOnly = searchParams.get('favorites') === 'true'

    // Build base filters (all must be true - AND logic)
    const baseFilters = [eq(reviewTechniques.userId, user.id!)]

    if (category) {
      baseFilters.push(eq(reviewTechniques.category, category))
    }
    if (beltLevel) {
      baseFilters.push(eq(reviewTechniques.beltLevel, beltLevel))
    }
    if (difficulty) {
      baseFilters.push(eq(reviewTechniques.difficulty, difficulty))
    }
    if (trainingType) {
      baseFilters.push(eq(reviewTechniques.trainingType, trainingType))
    }
    if (favoritesOnly) {
      baseFilters.push(eq(reviewTechniques.isFavorite, true))
    }

    // Build final where clause with search OR logic
    let finalWhere
    if (search) {
      // When searching: all base filters must be true AND (name matches OR description matches OR notes match)
      // Use COALESCE to handle NULL descriptions and notes
      const searchCondition = or(
        like(reviewTechniques.name, `%${search}%`),
        like(sql`COALESCE(${reviewTechniques.description}, '')`, `%${search}%`),
        like(sql`COALESCE(${reviewTechniques.notes}, '')`, `%${search}%`)
      )
      finalWhere = and(...baseFilters, searchCondition!)
    } else {
      // When not searching: just the base filters with AND logic
      finalWhere = and(...baseFilters)
    }

    // Apply sorting
    let orderBy
    switch (sort) {
      case 'name':
        orderBy = asc(reviewTechniques.name)
        break
      case 'viewed':
        orderBy = [desc(reviewTechniques.lastReviewed), desc(reviewTechniques.createdAt)]
        break
      case 'popular':
        orderBy = [desc(reviewTechniques.viewCount), desc(reviewTechniques.createdAt)]
        break
      case 'favorite':
        orderBy = [desc(reviewTechniques.isFavorite), desc(reviewTechniques.createdAt)]
        break
      case 'recent':
      default:
        orderBy = desc(reviewTechniques.createdAt)
        break
    }

    const techniques = await db.query.reviewTechniques.findMany({
      where: finalWhere,
      with: {
        videos: {
          orderBy: asc(reviewTechniqueVideos.orderIndex),
        },
      },
      orderBy,
    })

    return NextResponse.json(techniques)
  } catch (error) {
    return handleApiError(error)
  }
}

// POST /api/review-techniques
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth()
    const body = await request.json()
    const data = reviewTechniqueSchema.parse(body)

    // Create technique
    const technique = await db.insert(reviewTechniques).values({
      userId: user.id!,
      name: data.name,
      description: data.description || null,
      category: data.category || null,
      beltLevel: data.beltLevel || null,
      difficulty: data.difficulty || null,
      trainingType: data.trainingType || null,
      notes: data.notes || null,
    }).returning()

    // Create videos if provided
    if (data.videos && data.videos.length > 0) {
      const videosToInsert = data.videos.map((video, index) => ({
        reviewTechniqueId: technique[0].id,
        youtubeUrl: video.youtubeUrl,
        title: video.title || null,
        orderIndex: index,
      }))

      await db.insert(reviewTechniqueVideos).values(videosToInsert)
    }

    // Fetch the complete technique with videos
    const completeTechnique = await db.query.reviewTechniques.findFirst({
      where: eq(reviewTechniques.id, technique[0].id),
      with: {
        videos: {
          orderBy: asc(reviewTechniqueVideos.orderIndex),
        },
      },
    })

    return NextResponse.json(completeTechnique, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
