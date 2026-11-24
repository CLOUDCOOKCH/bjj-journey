import '@testing-library/jest-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { RecoveryWorkspace } from './recovery-workspace'

const originalFetch = global.fetch

function renderWorkspace() {
  const collections = new Map<string, { id: string; version: number; data: Record<string, unknown>; createdAt: string; updatedAt: string }[]>()
  const fetchRequests = jest.fn(async (endpoint: string, init: RequestInit) => {
    const collection = endpoint.split('/')[3]
    const records = collections.get(collection) ?? []
    if (init.method === 'GET') {
      return { status: 200, ok: true, json: async () => ({ items: records, nextCursor: null }) }
    }
    const payload = JSON.parse(String(init.body)) as { data: Record<string, unknown>; version?: number }
    const existing = records.find((record) => endpoint.endsWith(record.id))
    const now = new Date().toISOString()
    const next = {
      id: existing?.id ?? '32f27caf-618f-4dc3-886c-acd6c2ccbfa1',
      version: (existing?.version ?? 0) + 1,
      data: payload.data,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    }
    collections.set(collection, [next, ...records.filter(({ id }) => id !== next.id)])
    return { status: existing ? 200 : 201, ok: true, json: async () => next }
  })
  global.fetch = fetchRequests as unknown as typeof fetch
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } })
  const view = render(<QueryClientProvider client={queryClient}><RecoveryWorkspace userId="athlete" /></QueryClientProvider>)
  return {
    user: userEvent.setup(),
    fetchRequests,
    dispose() { view.unmount(); queryClient.clear() },
  }
}

afterEach(() => {
  global.fetch = originalFetch
})

test('saves a private check-in, edits it with a version, and enables readiness explicitly', async () => {
  const { user, fetchRequests, dispose } = renderWorkspace()
  const save = await screen.findByRole('button', { name: 'Save check-in' })
  await user.click(save)
  expect(screen.getByRole('alert')).toHaveTextContent('Enter at least one measure')

  const sleep = screen.getByRole('spinbutton', { name: 'Sleep hours' })
  await user.type(sleep, '6')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Muscle soreness' }), '3')
  await user.selectOptions(screen.getByRole('combobox', { name: 'Fatigue' }), '3')
  await user.click(save)
  await waitFor(() => expect(fetchRequests).toHaveBeenCalledWith('/api/training/recovery', expect.objectContaining({ method: 'POST' })))
  await screen.findByText('6 h')

  expect(screen.queryByText('Reduced intensity')).not.toBeInTheDocument()
  await user.click(screen.getByRole('checkbox', { name: 'Show readiness suggestions' }))
  await user.click(screen.getByRole('button', { name: 'Save preferences' }))
  expect(await screen.findByText('Reduced intensity')).toBeInTheDocument()
  expect(screen.getByText('Sleep was below your 7-hour target.')).toBeInTheDocument()

  const savedSleep = screen.getByRole('spinbutton', { name: 'Sleep hours' })
  await user.clear(savedSleep)
  await user.type(savedSleep, '8')
  await user.click(screen.getByRole('button', { name: 'Save check-in' }))
  await waitFor(() => expect(fetchRequests).toHaveBeenCalledWith('/api/training/recovery/32f27caf-618f-4dc3-886c-acd6c2ccbfa1', expect.objectContaining({
    method: 'PATCH', body: expect.stringContaining('"version":1'),
  })))
  expect(await screen.findByText('Normal training')).toBeInTheDocument()
  dispose()
})

test('supports the back-view body map, a precaution for persistent symptoms, and editing journal status', async () => {
  const { user, fetchRequests, dispose } = renderWorkspace()
  await user.click(await screen.findByRole('button', { name: 'Add entry' }))
  await user.click(screen.getByRole('button', { name: 'Back' }))
  await user.click(screen.getByRole('button', { name: 'Lower back' }))
  expect(screen.getByRole('combobox', { name: 'Body region' })).toHaveValue('Lower back')
  await user.selectOptions(screen.getByRole('combobox', { name: 'How it is changing' }), 'persistent')
  expect(screen.getByText('Consider professional assessment for severe, persistent or worsening symptoms.')).toBeInTheDocument()
  await user.click(screen.getByRole('button', { name: 'Save entry' }))
  await user.click(await screen.findByRole('button', { name: 'Edit Lower back entry' }))
  await user.selectOptions(screen.getByRole('combobox', { name: 'Status' }), 'resolved')
  await user.click(screen.getByRole('button', { name: 'Save entry' }))
  await waitFor(() => expect(fetchRequests).toHaveBeenCalledWith('/api/training/discomfort/32f27caf-618f-4dc3-886c-acd6c2ccbfa1', expect.objectContaining({
    method: 'PATCH', body: expect.stringContaining('"status":"resolved"'),
  })))
  expect(await screen.findByText(/resolved · 1\/5/)).toBeInTheDocument()
  dispose()
})
