'use client'

import { useSession } from 'next-auth/react'
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { get, patch } from '@/lib/api/client'
import type { Profile, User } from '@/lib/db/schema'
import type { ProfileUpdateInput } from '@/lib/validations/schema'

// ============================================================================
// Types
// ============================================================================

export type ProfileWithUser = Profile & {
  user: User
}

// ============================================================================
// Query Keys
// ============================================================================

export const profileKeys = {
  all: ['profiles'] as const,
  detail: () => [...profileKeys.all, 'detail'] as const,
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch the current user's profile
 */
export function useProfile(enabled?: boolean) {
  const { status } = useSession()

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => get<ProfileWithUser>('/api/profiles'),
    enabled: enabled ?? status === 'authenticated',
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Update the current user's profile
 */
export function useUpdateProfile(
  options?: Omit<UseMutationOptions<ProfileWithUser, Error, ProfileUpdateInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: ProfileUpdateInput) =>
      patch<ProfileWithUser>('/api/profiles', data),
  })
}
