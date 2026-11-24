import { act, renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trainingClient, TrainingRequestError, type TrainingRecord } from './client'
import { useWorkoutDraft, workoutStorageKey } from './workout-draft'
import type { WorkoutSession } from './workouts'

jest.mock('./client', () => ({
  ...jest.requireActual('./client'),
  trainingClient: { get: jest.fn(), update: jest.fn(), action: jest.fn() },
}))

const userId = 'test-athlete'
const id = 'workout-id'
const timestamp = '2026-01-01T10:00:00Z'
const workout: WorkoutSession = {
  title: 'Before class', category: 'strength', status: 'in_progress',
  startedAt: timestamp, elapsedSeconds: 30,
  exercises: [{ exerciseSlug: 'goblet-squat', name: 'Goblet squat', sets: [
    { id: 'set1', repetitions: 8, weightKg: 20, kind: 'working', completed: false },
  ] }],
}
function record(data = workout, version = 1): TrainingRecord<WorkoutSession> {
  return { id, data, version, createdAt: timestamp, updatedAt: timestamp }
}

const mockedGet = jest.mocked(trainingClient.get)
const mockedUpdate = jest.mocked(trainingClient.update)
const mockedAction = jest.mocked(trainingClient.action)
const originalOnline = Object.getOwnPropertyDescriptor(Navigator.prototype, 'onLine')

function setOnline(value: boolean) {
  Object.defineProperty(navigator, 'onLine', { configurable: true, value })
  window.dispatchEvent(new Event(value ? 'online' : 'offline'))
}

function mount() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  const hook = renderHook(() => useWorkoutDraft(userId, id), {
    wrapper: ({ children }) => <QueryClientProvider client={client}>{children}</QueryClientProvider>,
  })
  return { ...hook, client }
}

beforeEach(() => {
  localStorage.clear()
  jest.clearAllMocks()
  setOnline(true)
  mockedGet.mockResolvedValue(record())
})
afterEach(() => {
  if (originalOnline) Object.defineProperty(navigator, 'onLine', originalOnline)
})

it('retains offline edits across reopen and completes only after syncing the current version', async () => {
  const first = mount()
  await waitFor(() => expect(first.result.current.data?.title).toBe(workout.title))
  act(() => setOnline(false))
  act(() => first.result.current.edit(data => ({
    ...data, durationMinutes: 10,
    exercises: data.exercises.map(step => ({ ...step, sets: step.sets?.map(set => ({ ...set, completed: true })) })),
  })))
  expect(mockedUpdate).not.toHaveBeenCalled()
  expect(localStorage.getItem(workoutStorageKey(userId, id))).toContain('"completed":true')
  first.unmount()
  first.client.clear()

  mockedGet.mockRejectedValueOnce(new TypeError('Failed to fetch'))
  const second = mount()
  await waitFor(() => expect(second.result.current.data?.exercises[0].sets?.[0].completed).toBe(true))
  act(() => setOnline(true))
  const updated = second.result.current.data!
  const finished = record({ ...updated, status: 'completed' }, 3)
  mockedUpdate.mockResolvedValueOnce(record(updated, 2))
  mockedAction.mockResolvedValueOnce(finished)
  mockedGet.mockResolvedValue(finished)
  await act(async () => { await second.result.current.finish() })
  expect(mockedUpdate).toHaveBeenCalledWith('workouts', id, 1, updated)
  expect(mockedAction).toHaveBeenCalledWith('workouts', id, 'complete', { version: 2 })
  expect(localStorage.getItem(workoutStorageKey(userId, id))).toBeNull()
  await waitFor(() => expect(second.result.current.data?.status).toBe('completed'))
  second.unmount()
  second.client.clear()
})

it('requires an explicit choice after a version conflict', async () => {
  const hook = mount()
  await waitFor(() => expect(hook.result.current.data).toBeDefined())
  const otherVersion = record({ ...workout, notes: 'Saved elsewhere' }, 2)
  mockedUpdate.mockRejectedValueOnce(new TrainingRequestError(409, 'Version conflict'))
  mockedGet.mockResolvedValue(otherVersion)
  act(() => { hook.result.current.edit(data => ({ ...data, notes: 'On this device' })) })
  await act(async () => { await expect(hook.result.current.sync()).rejects.toThrow('Version conflict') })
  expect(hook.result.current.conflict).toBe(true)
  expect(hook.result.current.data?.notes).toBe('On this device')
  await act(async () => { await hook.result.current.resolve(false) })
  expect(hook.result.current.conflict).toBe(false)
  expect(hook.result.current.data?.notes).toBe('Saved elsewhere')
  expect(hook.result.current.hasPendingChanges).toBe(false)
  hook.unmount()
  hook.client.clear()
})
