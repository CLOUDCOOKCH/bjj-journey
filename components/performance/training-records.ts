'use client'

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingClient, type TrainingRecord } from '@/lib/training/client'
import type { TrainingCollection, TrainingData } from '@/lib/training/schemas'

export function usePerformanceRecords<K extends TrainingCollection>(collection: K, userId: string) {
  const queryKey = ['training', collection, userId] as const
  const privateData = ['recovery', 'discomfort'].includes(collection)
  const client = useQueryClient()
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => trainingClient.list<TrainingData<K>>(collection, signal),
    gcTime: privateData ? 0 : undefined,
    staleTime: privateData ? 0 : undefined,
  })
  const save = useMutation({
    retry: false,
    mutationFn: ({ data, previous }: { data: TrainingData<K>; previous?: TrainingRecord<TrainingData<K>> }) => previous
      ? trainingClient.update(collection, previous.id, previous.version, data)
      : trainingClient.create(collection, data),
    onSuccess: async (record) => {
      client.setQueryData<TrainingRecord<TrainingData<K>>[]>(queryKey, (rows) => [
        record,
        ...(rows ?? []).filter((row) => row.id !== record.id),
      ])
      await client.invalidateQueries({ queryKey: ['training', collection] })
    },
  })
  const remove = useMutation({
    retry: false,
    mutationFn: (record: TrainingRecord<TrainingData<K>>) => trainingClient.remove(collection, record.id, record.version),
    onSuccess: async (_, record) => {
      client.setQueryData<TrainingRecord<TrainingData<K>>[]>(queryKey, (rows) => rows?.filter((row) => row.id !== record.id))
      await client.invalidateQueries({ queryKey: ['training', collection] })
    },
  })
  return { query, save, remove }
}
