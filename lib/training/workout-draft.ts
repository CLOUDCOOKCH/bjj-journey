'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { trainingClient, TrainingRequestError, type TrainingRecord } from './client'
import type { WorkoutSession } from './workouts'

interface QueuedWorkout {
  version: number
  data: WorkoutSession
}

interface StoredWorkout {
  saved: TrainingRecord<WorkoutSession>
  draft?: QueuedWorkout
}

export function workoutStorageKey(userId: string, id: string) {
  return `bjj-journey:workout:${userId}:${id}`
}

function readSaved(key: string, id: string): StoredWorkout | null {
  try {
    const saved = JSON.parse(localStorage.getItem(key) ?? 'null') as StoredWorkout | null
    return saved?.saved.id === id ? saved : null
  } catch {
    return null
  }
}

function canViewLocal(error: unknown) {
  return !(error instanceof TrainingRequestError) || error.status >= 500
}

export function useWorkoutDraft(userId: string, id: string) {
  const key = workoutStorageKey(userId, id)
  const client = useQueryClient()
  const queryKey = ['training', 'workouts', 'live', userId, id] as const
  const query = useQuery({
    queryKey,
    queryFn: () => trainingClient.get<WorkoutSession>('workouts', id),
    staleTime: 0,
    networkMode: 'always',
    retry: false,
  })
  const latest = useRef<StoredWorkout | null>(null)
  const request = useRef<Promise<TrainingRecord<WorkoutSession>> | null>(null)
  const conflictRef = useRef(false)
  const [stored, setStored] = useState<StoredWorkout | null>(null)
  const [conflict, setConflictState] = useState(false)
  const [online, setOnline] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [storageError, setStorageError] = useState('')

  const remember = useCallback((next: StoredWorkout | null) => {
    latest.current = next
    setStored(next)
    try {
      if (!next || next.saved.data.status === 'completed') localStorage.removeItem(key)
      else localStorage.setItem(key, JSON.stringify(next))
      setStorageError('')
    } catch {
      setStorageError('This browser could not keep an on-device copy. Stay on this page until changes sync.')
    }
  }, [key])

  const setConflict = useCallback((next: boolean) => {
    conflictRef.current = next
    setConflictState(next)
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setOnline(navigator.onLine)
      if (!latest.current) remember(readSaved(key, id))
    }, 0)
    return () => window.clearTimeout(timer)
  }, [id, key, remember])

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine)
    window.addEventListener('online', updateOnline)
    window.addEventListener('offline', updateOnline)
    return () => {
      window.removeEventListener('online', updateOnline)
      window.removeEventListener('offline', updateOnline)
    }
  }, [])

  useEffect(() => {
    const timer = window.setTimeout(() => {
      if (query.error && !canViewLocal(query.error)) { remember(null); return }
      if (!query.data || request.current) return
      const previous = latest.current
      if (previous && query.data.version < previous.saved.version) return
      if (previous?.draft && query.data.data.status !== 'completed' && previous.draft.version !== query.data.version) {
        setConflict(true)
        if (previous.saved.version !== query.data.version) remember({ ...previous, saved: query.data })
        return
      }
      if (previous?.saved.version === query.data.version) return
      remember({ saved: query.data })
    }, 0)
    return () => window.clearTimeout(timer)
  }, [query.data, query.error, remember, setConflict])

  const sync = useCallback(async function syncDraft(): Promise<TrainingRecord<WorkoutSession>> {
    if (request.current) {
      await request.current
      return syncDraft()
    }
    const initial = latest.current
    if (!initial) throw new Error('Open the workout before saving.')
    if (!initial.draft) return initial.saved
    if (conflictRef.current) throw new Error('Choose which version to keep before syncing.')
    if (!navigator.onLine) throw new Error('Reconnect to sync your workout.')
    const submitted = initial.draft
    const pending = trainingClient.update('workouts', id, submitted.version, submitted.data)
    request.current = pending
    setSaving(true)
    setSaveError('')
    try {
      const result = await pending
      const current = latest.current
      const newer = current?.draft && current.draft !== submitted ? current.draft : undefined
      remember({ saved: result, draft: newer ? { ...newer, version: result.version } : undefined })
      return result
    } catch (error) {
      if (error instanceof TrainingRequestError && error.status === 409) {
        setConflict(true)
        try {
          const saved = await trainingClient.get<WorkoutSession>('workouts', id)
          if (saved.data.status === 'completed') {
            remember({ saved })
            setConflict(false)
            return saved
          }
          remember({ draft: latest.current?.draft, saved })
        } catch {
          // The server response can be fetched again if the network drops during conflict resolution.
        }
      }
      setSaveError(error instanceof Error ? error.message : 'Workout updates could not sync.')
      throw error
    } finally {
      request.current = null
      setSaving(false)
    }
  }, [id, remember, setConflict])

  useEffect(() => {
    if (!stored?.draft || !online || conflict || saving || saveError) return
    const timer = window.setTimeout(() => { void sync().catch(() => undefined) }, 650)
    return () => window.clearTimeout(timer)
  }, [stored?.draft, online, conflict, saving, saveError, sync])

  const edit = useCallback((change: (data: WorkoutSession) => WorkoutSession) => {
    const current = latest.current
    if (!current || current.saved.data.status === 'completed') return
    remember({
      saved: current.saved,
      draft: {
        version: current.draft?.version ?? current.saved.version,
        data: change(current.draft?.data ?? current.saved.data),
      },
    })
    setSaveError('')
  }, [remember])

  async function resolve(keepLocal: boolean) {
    const current = latest.current
    if (!current || !online) return
    try {
      const saved = await trainingClient.get<WorkoutSession>('workouts', id)
      const draft = latest.current?.draft
      remember({
        saved,
        draft: keepLocal && draft && saved.data.status !== 'completed' ? { ...draft, version: saved.version } : undefined,
      })
      setConflict(false)
      setSaveError('')
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Could not load the server workout.')
    }
  }

  async function finish() {
    let saved = await sync()
    while (latest.current?.draft) saved = await sync()
    let result = saved
    if (saved.data.status !== 'completed') {
      try {
        result = await trainingClient.action<WorkoutSession>('workouts', id, 'complete', { version: saved.version })
      } catch (error) {
        if (!(error instanceof TrainingRequestError) || error.status !== 409) throw error
        const current = await trainingClient.get<WorkoutSession>('workouts', id)
        if (current.data.status !== 'completed') {
          remember({ saved: current, draft: { data: saved.data, version: saved.version } })
          setConflict(true)
          throw new Error('Review the newer version before completing this workout.')
        }
        result = current
      }
    }
    remember({ saved: result })
    client.setQueryData(queryKey, result)
    await Promise.all([
      client.invalidateQueries({ queryKey: ['training', 'workouts'] }),
      client.invalidateQueries({ queryKey: ['training', 'activities'] }),
    ])
    return result
  }

  return {
    data: stored?.draft?.data ?? stored?.saved.data,
    loading: !stored && query.isPending,
    error: stored && canViewLocal(query.error) ? undefined : query.error,
    edit, finish, sync, resolve,
    online, saving, conflict,
    hasPendingChanges: Boolean(stored?.draft),
    saveError, storageError,
    retry: query.refetch,
  }
}
