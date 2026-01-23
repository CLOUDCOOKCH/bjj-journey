'use client'

import { useMutation, type UseMutationOptions } from '@tanstack/react-query'
import { post, patch } from '@/lib/api/client'
import type { Technique } from '@/lib/db/schema'
import type { TechniqueInput, TechniqueUpdateInput } from '@/lib/validations/schema'

// ============================================================================
// Query Keys
// ============================================================================

export const techniqueKeys = {
  all: ['techniques'] as const,
  detail: (id: string) => [...techniqueKeys.all, 'detail', id] as const,
}

// ============================================================================
// Mutations
// ============================================================================

/**
 * Create a new technique
 */
export function useCreateTechnique(
  options?: Omit<UseMutationOptions<Technique, Error, TechniqueInput>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: (data: TechniqueInput) =>
      post<Technique>('/api/techniques', data),
  })
}

/**
 * Update a technique
 */
export function useUpdateTechnique(
  options?: Omit<UseMutationOptions<Technique, Error, { id: string; data: TechniqueUpdateInput }>, 'mutationFn'>
) {
  return useMutation({
    ...options,
    mutationFn: ({ id, data }: { id: string; data: TechniqueUpdateInput }) =>
      patch<Technique>(`/api/techniques/${id}`, data),
  })
}
