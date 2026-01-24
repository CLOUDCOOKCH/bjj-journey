'use client'

import { useSession } from 'next-auth/react'
import { useQuery, useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { get, post, patch, del } from '@/lib/api/client'
import type { ReviewTechnique } from '@/lib/db/schema'
import type { ReviewTechniqueInput, ReviewTechniqueUpdateInput } from '@/lib/validations/schema'

// Extended type with videos
export type ReviewTechniqueWithVideos = ReviewTechnique & {
  videos: Array<{
    id: string
    reviewTechniqueId: string
    youtubeUrl: string
    title: string | null
    thumbnailUrl: string | null
    orderIndex: number
    createdAt: Date
  }>
}

interface ReviewTechniquesFilters {
  category?: string
  beltLevel?: string
  difficulty?: string
  trainingType?: string
  search?: string
  sort?: string
  favorites?: boolean
}

// ============================================================================
// Query Keys
// ============================================================================

export const reviewTechniqueKeys = {
  all: ['review-techniques'] as const,
  lists: () => [...reviewTechniqueKeys.all, 'list'] as const,
  list: (filters: ReviewTechniquesFilters) => [...reviewTechniqueKeys.all, 'list', filters] as const,
  detail: (id: string) => [...reviewTechniqueKeys.all, 'detail', id] as const,
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all review techniques for the current user
 */
export function useReviewTechniques(filters: ReviewTechniquesFilters = {}, enabled?: boolean) {
  const { status } = useSession()

  const params = new URLSearchParams()
  if (filters.category) params.set('category', filters.category)
  if (filters.beltLevel) params.set('beltLevel', filters.beltLevel)
  if (filters.difficulty) params.set('difficulty', filters.difficulty)
  if (filters.trainingType) params.set('trainingType', filters.trainingType)
  if (filters.search) params.set('search', filters.search)
  if (filters.sort) params.set('sort', filters.sort)
  if (filters.favorites) params.set('favorites', 'true')

  const queryString = params.toString()

  return useQuery({
    queryKey: reviewTechniqueKeys.list(filters),
    queryFn: () => get<ReviewTechniqueWithVideos[]>(`/api/review-techniques${queryString ? `?${queryString}` : ''}`),
    enabled: enabled ?? status === 'authenticated',
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch a single review technique by ID
 */
export function useReviewTechnique(id: string) {
  return useQuery({
    queryKey: reviewTechniqueKeys.detail(id),
    queryFn: () => get<ReviewTechniqueWithVideos>(`/api/review-techniques/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new review technique
 */
export function useCreateReviewTechnique(
  options?: Omit<UseMutationOptions<ReviewTechniqueWithVideos, Error, ReviewTechniqueInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: ReviewTechniqueInput) =>
      post<ReviewTechniqueWithVideos>('/api/review-techniques', data),
  })
}

/**
 * Update a review technique
 */
export function useUpdateReviewTechnique(
  options?: Omit<UseMutationOptions<ReviewTechniqueWithVideos, Error, { id: string; data: ReviewTechniqueUpdateInput }>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: ReviewTechniqueUpdateInput }) =>
      patch<ReviewTechniqueWithVideos>(`/api/review-techniques/${id}`, data),
  })
}

/**
 * Delete a review technique
 */
export function useDeleteReviewTechnique(
  options?: Omit<UseMutationOptions<{ success: true }, Error, string>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (id: string) =>
      del<{ success: true }>(`/api/review-techniques/${id}`),
  })
}

/**
 * Toggle favorite status on a review technique
 */
export function useToggleFavorite(
  options?: Omit<UseMutationOptions<ReviewTechniqueWithVideos, Error, { id: string; isFavorite: boolean }>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: ({ id, isFavorite }: { id: string; isFavorite: boolean }) =>
      patch<ReviewTechniqueWithVideos>(`/api/review-techniques/${id}`, { isFavorite }),
  })
}
