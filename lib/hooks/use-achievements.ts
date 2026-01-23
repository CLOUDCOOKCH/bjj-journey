'use client'

import { useSession } from 'next-auth/react'
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { get, post, del } from '@/lib/api/client'
import type { Achievement } from '@/lib/db/schema'
import type { AchievementInput } from '@/lib/validations/schema'

// ============================================================================
// Query Keys
// ============================================================================

export const achievementKeys = {
  all: ['achievements'] as const,
  lists: () => [...achievementKeys.all, 'list'] as const,
  detail: (id: string) => [...achievementKeys.all, 'detail', id] as const,
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all achievements for the current user
 */
export function useAchievements() {
  const { status } = useSession()

  return useQuery({
    queryKey: achievementKeys.lists(),
    queryFn: () => get<Achievement[]>('/api/achievements'),
    enabled: status === 'authenticated',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/**
 * Fetch a single achievement by ID
 */
export function useAchievement(id: string) {
  return useQuery({
    queryKey: achievementKeys.detail(id),
    queryFn: () => get<Achievement>(`/api/achievements/${id}`),
    enabled: !!id,
    staleTime: 10 * 60 * 1000, // 10 minutes
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new achievement
 */
export function useCreateAchievement(
  options?: Omit<UseMutationOptions<Achievement, Error, AchievementInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: AchievementInput) =>
      post<Achievement>('/api/achievements', data),
  })
}

/**
 * Delete an achievement
 */
export function useDeleteAchievement(
  options?: Omit<UseMutationOptions<{ success: true }, Error, string>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (id: string) =>
      del<{ success: true }>(`/api/achievements/${id}`),
  })
}
