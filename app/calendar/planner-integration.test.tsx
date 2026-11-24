import { webcrypto } from 'node:crypto'
import { TextEncoder } from 'node:util'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { useRouter, useSearchParams } from 'next/navigation'
import type { ReactNode } from 'react'
import DashboardPage from '@/app/dashboard/page'
import StartTrainingPage from '@/app/start-training/page'
import type { TrainingRecord } from '@/lib/training/client'
import type { PlannedActivity } from '@/lib/training/planner'
import CalendarPage from './page'

jest.mock('next/navigation', () => ({
  usePathname: () => '/calendar',
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
  redirect: jest.fn(),
}))

jest.mock('@/components/monthly-chart', () => ({ MonthlyChart: () => <div>Mat volume</div> }))
jest.mock('@uiw/react-md-editor', () => ({ __esModule: true, default: () => <textarea aria-label="Notes" /> }))

const plannerDate = '2026-11-24'
const activityId = 'bf8098eb-0dba-4b32-8aca-138c1ed01df0'
const journalId = '46a23a01-dac6-403c-9834-ca421ffe4d68'
const push = jest.fn()
const nativeFetch = global.fetch

function json(data: unknown, status = 200) {
  return { ok: status < 400, status, json: async () => data } as Response
}

function record<T>(id: string, data: T, version = 1): TrainingRecord<T> {
  return { id, data, version, createdAt: '2026-11-24T00:00:00Z', updatedAt: '2026-11-24T00:00:00Z' }
}

function activity(data: Partial<PlannedActivity> = {}) {
  return record(activityId, {
    title: 'Evening Gi', category: 'bjj_gi', status: 'planned', date: plannerDate, durationMinutes: 90, timeZone: 'UTC', ...data,
  } as PlannedActivity)
}

function renderWithQuery(ui: ReactNode) {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 }, mutations: { retry: false } } })
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>)
}

function fallback(path: string) {
  if (path.startsWith('/api/journal-entries?')) return json({ entries: [], total: 0, hasMore: false })
  if (path.startsWith('/api/profiles')) return json({ belt: 'blue', stripes: 1, monthlyGoal: 12, user: { name: 'Athlete' } })
  if (path.startsWith('/api/training/')) return json({ items: [], nextCursor: null })
  throw new Error(`Unexpected request to ${path}`)
}

beforeEach(() => {
  jest.clearAllMocks()
  jest.mocked(useRouter).mockReturnValue({ push, replace: jest.fn(), prefetch: jest.fn(), back: jest.fn(), forward: jest.fn(), refresh: jest.fn() } as ReturnType<typeof useRouter>)
  jest.mocked(useSearchParams).mockReturnValue(new URLSearchParams({ date: plannerDate }) as ReturnType<typeof useSearchParams>)
})

afterEach(() => {
  global.fetch = nativeFetch
})

test('schedules and reschedules an owned activity using the current server version', async () => {
  let planned: TrainingRecord<PlannedActivity> | undefined
  const requests: { path: string; body: Record<string, unknown> }[] = []

  global.fetch = jest.fn(async (input, init) => {
    const path = String(input)
    if (path === '/api/training/activities' && init?.method === 'GET') {
      return json({ items: planned ? [planned] : [], nextCursor: null })
    }
    if (path.startsWith('/api/training/activities') && init?.body) {
      const body = JSON.parse(String(init.body))
      requests.push({ path, body })
      planned = record(activityId, body.data, init.method === 'PATCH' ? 2 : 1)
      return json(planned, init.method === 'POST' ? 201 : 200)
    }
    return fallback(path)
  })

  renderWithQuery(<CalendarPage />)
  fireEvent.click(await screen.findByRole('button', { name: 'Schedule' }))
  fireEvent.change(screen.getByLabelText('Name'), { target: { value: 'Open guard drilling' } })
  fireEvent.change(screen.getByLabelText('Start time', { exact: false }), { target: { value: '18:30' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))
  expect(await screen.findByText('Activity saved.')).toBeInTheDocument()
  expect(requests[0]).toMatchObject({
    path: '/api/training/activities',
    body: { data: { title: 'Open guard drilling', date: plannerDate, time: '18:30', status: 'planned' } },
  })

  const agenda = screen.getByRole('region', { name: 'Selected day activities' })
  fireEvent.click(within(agenda).getByRole('button', { name: /Open guard drilling/ }))
  fireEvent.click(within(agenda).getByRole('button', { name: 'Edit' }))
  fireEvent.change(screen.getByLabelText('Date', { exact: true }), { target: { value: '2026-11-25' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save activity' }))
  await waitFor(() => expect(requests[1]).toMatchObject({
    path: `/api/training/activities/${activityId}`,
    body: { version: 1, data: { date: '2026-11-25', title: 'Open guard drilling' } },
  }))
  await waitFor(() => expect(screen.getByRole('heading', { name: 'Wednesday, November 25' })).toBeInTheDocument())
})

test('logs a scheduled mat session through the atomic planner action and preserves the calendar date', async () => {
  const scheduled = activity({ category: 'bjj_no_gi', date: plannerDate })
  const save = jest.fn()
  jest.mocked(useSearchParams).mockReturnValue(new URLSearchParams({ activityId }) as ReturnType<typeof useSearchParams>)
  global.fetch = jest.fn(async (input, init) => {
    const path = String(input)
    if (path === `/api/training/activities/${activityId}`) return json(scheduled)
    if (path === `/api/training/activities/${activityId}/journal`) {
      save(JSON.parse(String(init?.body)))
      return json(record(activityId, { ...scheduled.data, status: 'completed', journalEntryId: journalId }, 2))
    }
    return fallback(path)
  })
  renderWithQuery(<StartTrainingPage />)
  expect(await screen.findByLabelText('Session type')).toHaveValue('no_gi')
  fireEvent.change(screen.getByLabelText('Sparring rounds'), { target: { value: '4' } })
  fireEvent.change(screen.getByLabelText('Positions trained'), { target: { value: 'Half guard' } })
  fireEvent.change(screen.getByLabelText('What worked?'), { target: { value: 'Underhook sweep' } })
  fireEvent.change(screen.getByLabelText('What will you drill next?'), { target: { value: 'Bottom frames' } })
  fireEvent.change(screen.getByLabelText(/Session effort/), { target: { value: '7' } })
  fireEvent.click(screen.getByRole('button', { name: 'Save Session' }))
  await waitFor(() => expect(save).toHaveBeenCalledWith({
    version: 1,
    data: expect.objectContaining({ entryDate: plannerDate, sessionType: 'no_gi', sessionRpe: 7, durationMinutes: 90, trainingDetails: { sparringRounds: 4, positionsTrained: 'Half guard', successfulTechniques: 'Underhook sweep', techniquesToImprove: 'Bottom frames' } }),
  }))
  await waitFor(() => expect(push).toHaveBeenCalledWith(`/calendar?date=${plannerDate}`))
})

test('hides dashboard widgets from account preferences and saves future changes with version checks', async () => {
  const initial = { key: 'dashboard', widgetOrder: ['belt', 'recovery'], hiddenWidgets: ['recovery'] }
  let preferences = record('preferences-id', initial)
  const update = jest.fn()
  global.fetch = jest.fn(async (input, init) => {
    const path = String(input)
    if (path === '/api/training/preferences' && init?.method === 'GET') return json({ items: [preferences], nextCursor: null })
    if (path === '/api/training/preferences/preferences-id' && init?.method === 'PATCH') {
      const body = JSON.parse(String(init.body))
      update(body)
      preferences = record(preferences.id, body.data, 2)
      return json(preferences)
    }
    return fallback(path)
  })

  renderWithQuery(<DashboardPage />)
  expect(await screen.findByRole('heading', { name: 'Belt progression' })).toBeInTheDocument()
  expect(screen.queryByText('Strength', { exact: true })).not.toBeInTheDocument()
  expect(screen.queryByText('Mobility', { exact: true })).not.toBeInTheDocument()
  expect(screen.getAllByRole('link', { name: 'Log mat session' }).length).toBeGreaterThan(0)
  expect(screen.queryByRole('heading', { name: 'Recovery' })).not.toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Customise' }))
  fireEvent.click(screen.getByRole('checkbox', { name: 'Recovery' }))
  fireEvent.click(screen.getByRole('button', { name: 'Save dashboard' }))
  await waitFor(() => expect(update).toHaveBeenCalledWith(expect.objectContaining({ version: 1, data: expect.objectContaining({ key: 'dashboard', hiddenWidgets: [] }) })))
  expect(await screen.findByRole('heading', { name: 'Recovery' })).toBeInTheDocument()
})

test('copies eligible previous-week activities exactly once through the batch endpoint', async () => {
  const originalSubtle = Object.getOwnPropertyDescriptor(global.crypto, 'subtle')
  const originalEncoder = Object.getOwnPropertyDescriptor(global, 'TextEncoder')
  Object.defineProperty(global.crypto, 'subtle', { value: webcrypto.subtle, configurable: true })
  Object.defineProperty(global, 'TextEncoder', { value: TextEncoder, configurable: true })
  const previous = activity({ date: '2026-11-17', title: 'Previous week Gi', status: 'completed', journalEntryId: journalId })
  const saved: TrainingRecord<PlannedActivity>[] = [previous]
  const batch = jest.fn()
  global.fetch = jest.fn(async (input, init) => {
    const path = String(input)
    if (path === '/api/training/activities' && init?.method === 'GET') return json({ items: saved, nextCursor: null })
    if (path === '/api/training/activities/batch') {
      const payload = JSON.parse(String(init?.body))
      batch(payload)
      const records = payload.items.map(({ id, data }: { id: string; data: PlannedActivity }) => record(id, data))
      saved.push(...records)
      return json(records)
    }
    return fallback(path)
  })

  try {
    renderWithQuery(<CalendarPage />)
    fireEvent.click(await screen.findByRole('button', { name: 'Copy previous week' }))
    expect(await screen.findByText('Copied 1 activity into this week.')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('button', { name: 'Copy previous week' })).toBeEnabled())
    expect(batch).toHaveBeenCalledTimes(1)
    const [item] = batch.mock.calls[0][0].items
    expect(item.id).not.toBe(previous.id)
    expect(item.data).toMatchObject({ title: previous.data.title, date: plannerDate, status: 'planned' })
    expect(item.data.journalEntryId).toBeUndefined()
    fireEvent.click(screen.getByRole('button', { name: 'Copy previous week' }))
    expect(await screen.findByText('There are no new activities to copy.')).toBeInTheDocument()
    expect(batch).toHaveBeenCalledTimes(1)
  } finally {
    if (originalSubtle) Object.defineProperty(global.crypto, 'subtle', originalSubtle)
    else Reflect.deleteProperty(global.crypto, 'subtle')
    if (originalEncoder) Object.defineProperty(global, 'TextEncoder', originalEncoder)
    else Reflect.deleteProperty(global, 'TextEncoder')
  }
})
