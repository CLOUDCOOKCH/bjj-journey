'use client'

import { useSession } from 'next-auth/react'
import { useMutation, useQuery, useInfiniteQuery, type UseMutationOptions } from '@tanstack/react-query'
import { get, post, patch, del } from '@/lib/api/client'
import type { JournalEntry } from '@/lib/db/schema'
import type { JournalEntryInput, JournalEntryUpdateInput } from '@/lib/validations/schema'

// Extend JournalEntry to include techniques
export type JournalEntryWithTechniques = JournalEntry & {
  techniques: Array<{
    id: string
    journalEntryId: string
    name: string
    youtubeUrl: string | null
    notes: string | null
    createdAt: Date
  }>
}

interface JournalEntriesResponse {
  entries: JournalEntryWithTechniques[]
  total: number
  hasMore: boolean
}

// ============================================================================
// Query Keys
// ============================================================================

export const journalEntryKeys = {
  all: ['journal-entries'] as const,
  lists: () => [...journalEntryKeys.all, 'list'] as const,
  list: (sort: string) => [...journalEntryKeys.all, 'list', sort] as const,
  detail: (id: string) => [...journalEntryKeys.all, 'detail', id] as const,
}

// ============================================================================
// Queries
// ============================================================================

/**
 * Fetch all journal entries for the current user (legacy, for backwards compatibility)
 */
export function useJournalEntries(enabled?: boolean) {
  const { status } = useSession()

  return useQuery({
    queryKey: journalEntryKeys.lists(),
    queryFn: async () => {
      const response = await get<JournalEntriesResponse>('/api/journal-entries')
      return response.entries
    },
    enabled: enabled ?? status === 'authenticated',
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch paginated journal entries using infinite scroll
 */
export function useInfiniteJournalEntries(sort: string = 'latest', enabled?: boolean) {
  const { status } = useSession()

  return useInfiniteQuery({
    queryKey: journalEntryKeys.list(sort),
    queryFn: async ({ pageParam = 0 }) => {
      const response = await get<JournalEntriesResponse>(
        `/api/journal-entries?limit=20&offset=${pageParam}&sort=${sort}`
      )
      return response
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage) => {
      if (lastPage.hasMore) {
        return lastPage.entries.length
      }
      return undefined
    },
    enabled: enabled ?? status === 'authenticated',
    staleTime: 2 * 60 * 1000, // 2 minutes
  })
}

/**
 * Fetch a single journal entry by ID
 */
export function useJournalEntry(id: string) {
  return useQuery({
    queryKey: journalEntryKeys.detail(id),
    queryFn: () => get<JournalEntryWithTechniques>(`/api/journal-entries/${id}`),
    enabled: !!id,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new journal entry
 */
export function useCreateJournalEntry(
  options?: Omit<UseMutationOptions<JournalEntry, Error, JournalEntryInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: JournalEntryInput) =>
      post<JournalEntry>('/api/journal-entries', data),
  })
}

/**
 * Update a journal entry
 */
export function useUpdateJournalEntry(
  options?: Omit<UseMutationOptions<JournalEntry, Error, { id: string; data: JournalEntryUpdateInput }>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: JournalEntryUpdateInput }) =>
      patch<JournalEntry>(`/api/journal-entries/${id}`, data),
  })
}

/**
 * Delete a journal entry
 */
export function useDeleteJournalEntry(
  options?: Omit<UseMutationOptions<{ success: true }, Error, string>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (id: string) =>
      del<{ success: true }>(`/api/journal-entries/${id}`),
  })
}
