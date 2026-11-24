'use client'

import { useQuery } from '@tanstack/react-query'
import { trainingClient, TrainingRequestError } from './client'
import { journalEntryKeys, type JournalEntryWithTechniques } from '@/lib/hooks/use-journal-entries'
import { useSession } from 'next-auth/react'
import type { ActivityOccurrence, PlannedActivity } from './planner'

export function trainingQueryKey(collection: string) {
  return ['training', collection] as const
}

export function useTrainingList<T>(collection: string, enabled = true) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  return useQuery({
    queryKey: [...trainingQueryKey(collection), userId],
    enabled: !!userId && enabled,
    ...(collection === 'recovery' || collection === 'discomfort' ? { gcTime: 0, staleTime: 0 } : {}),
    queryFn: ({ signal }) => trainingClient.list<T>(collection, signal),
  })
}

export async function occurrenceUuid(seriesId: string, date: string) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${seriesId}:${date}`))
  const bytes = [...new Uint8Array(hash).slice(0, 16)]
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = bytes.map((byte) => byte.toString(16).padStart(2, '0')).join('')
  return [hex.slice(0, 8), hex.slice(8, 12), hex.slice(12, 16), hex.slice(16, 20), hex.slice(20)].join('-')
}

export async function getConcreteOccurrence(occurrence: ActivityOccurrence, updatedData?: PlannedActivity) {
  if (!occurrence.virtual) return occurrence.record

  const seriesId = occurrence.record.id
  const id = await occurrenceUuid(seriesId, occurrence.date)
  const data = updatedData ?? { ...occurrence.record.data, date: occurrence.date }
  const payload = { ...data, repeat: undefined, seriesId, occurrenceDate: occurrence.date }
  try {
    const saved = await trainingClient.create('activities', payload, id)
    if (updatedData) {
      const fields = new Set([...Object.keys(saved.data), ...Object.keys(payload)] as (keyof PlannedActivity)[])
      if ([...fields].some((field) => saved.data[field] !== payload[field])) {
        throw new Error('This occurrence was updated elsewhere. Reopen the planner before making further changes.')
      }
    }
    return saved
  } catch (error) {
    if (!(error instanceof TrainingRequestError) || error.status !== 409 || updatedData) throw error
    return trainingClient.get<PlannedActivity>('activities', id)
  }
}

export function useCalendarJournalEntries() {
  const { data: session } = useSession()
  const userId = session?.user?.id
  return useQuery({
    queryKey: [...journalEntryKeys.lists(), 'calendar', userId],
    enabled: !!userId,
    queryFn: async ({ signal }) => {
      const entries: JournalEntryWithTechniques[] = []
      let offset = 0
      while (true) {
        const response = await fetch(`/api/journal-entries?limit=100&offset=${offset}`, { cache: 'no-store', signal })
        if (!response.ok) throw new Error('Journal entries could not be loaded.')
        const page: { entries: JournalEntryWithTechniques[]; hasMore: boolean } = await response.json()
        entries.push(...page.entries)
        if (!page.hasMore || !page.entries.length) return entries
        offset += page.entries.length
      }
    },
  })
}
