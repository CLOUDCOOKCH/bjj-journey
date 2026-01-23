'use client'

import { useSession } from 'next-auth/react'
import { useMutation, useQuery, type UseMutationOptions } from '@tanstack/react-query'
import { get, patch } from '@/lib/api/client'
import type { Profile } from '@/lib/db/schema'
import type { ProfileUpdateInput } from '@/lib/validations/schema'

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
export function useProfile() {
  const { data: session, status } = useSession()

  return useQuery({
    queryKey: profileKeys.detail(),
    queryFn: () => get<Profile>('/api/profiles'),
    enabled: status === 'authenticated',
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
  options?: Omit<UseMutationOptions<Profile, Error, ProfileUpdateInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: ProfileUpdateInput) =>
      patch<Profile>('/api/profiles', data),
  })
}
