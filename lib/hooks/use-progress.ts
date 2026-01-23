'use client'

import { useSession } from 'next-auth/react'
import { useQuery } from '@tanstack/react-query'
import { calculateBeltProgress } from '@/lib/utils/progress-calculations'
import type { BeltProgressStats } from '@/lib/utils/progress-calculations'

// ============================================================================
// Query Keys
// ============================================================================

export const progressKeys = {
  all: ['progress'] as const,
  stats: () => [...progressKeys.all, 'stats'] as const,
}

// ============================================================================
// Types
// ============================================================================

export interface ProgressData extends BeltProgressStats {
  isLoading: boolean
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Calculate progress stats from profile and journal entries
 * Note: This hook depends on data from other hooks and should be used with them
 */
export function useProgressStats(
  profile: { belt: string; stripes: number; currentBeltDate: string | null } | undefined,
  journalEntries: any[] | undefined,
  _achievements: any[] | undefined,
  enabled?: boolean
) {
  const { status } = useSession()

  return useQuery<BeltProgressStats>({
    queryKey: progressKeys.stats(),
    queryFn: () => {
      if (!profile) {
        throw new Error('Profile data is required')
      }

      return calculateBeltProgress(
        profile,
        journalEntries || []
      )
    },
    enabled:
      (enabled ?? status === 'authenticated') &&
      !!profile &&
      journalEntries !== undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
