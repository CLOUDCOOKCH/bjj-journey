export interface TrainingRecord<T> {
  id: string
  version: number
  data: T
  createdAt: string
  updatedAt: string
}

export interface TrainingPage<T> {
  items: TrainingRecord<T>[]
  nextCursor: string | null
}

export class TrainingRequestError extends Error {
  constructor(public status: number, message: string) {
    super(message)
    this.name = 'TrainingRequestError'
  }
}

async function request<T>(path: string, method = 'GET', body?: unknown, signal?: AbortSignal): Promise<T> {
  const response = await fetch(`/api/training/${path}`, {
    method,
    signal,
    cache: 'no-store',
    headers: body === undefined ? undefined : { 'Content-Type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body),
  })
  if (response.status === 204) return undefined as T
  const data = await response.json()
  if (!response.ok) throw new TrainingRequestError(response.status, data?.error ?? 'Training request failed')
  return data as T
}

export const trainingClient = {
  async list<T>(collection: string, signal?: AbortSignal): Promise<TrainingRecord<T>[]> {
    const records: TrainingRecord<T>[] = []
    let cursor: string | null = null
    do {
      const query = cursor ? `?cursor=${encodeURIComponent(cursor)}` : ''
      const page: TrainingPage<T> = await request<TrainingPage<T>>(`${collection}${query}`, 'GET', undefined, signal)
      records.push(...page.items)
      cursor = page.nextCursor
    } while (cursor)
    return records
  },
  get<T>(collection: string, id: string) {
    return request<TrainingRecord<T>>(`${collection}/${encodeURIComponent(id)}`)
  },
  create<T>(collection: string, data: T, id?: string) {
    return request<TrainingRecord<T>>(collection, 'POST', { data, id })
  },
  update<T>(collection: string, id: string, version: number, data: T) {
    return request<TrainingRecord<T>>(`${collection}/${encodeURIComponent(id)}`, 'PATCH', { version, data })
  },
  remove(collection: string, id: string, version: number) {
    return request<void>(`${collection}/${encodeURIComponent(id)}?version=${version}`, 'DELETE')
  },
  action<T>(collection: string, id: string, action: string, body: unknown) {
    return request<TrainingRecord<T>>(`${collection}/${encodeURIComponent(id)}/${encodeURIComponent(action)}`, 'POST', body)
  },
  createBatch<T>(items: { id: string; data: T }[]) {
    return request<TrainingRecord<T>[]>('activities/batch', 'POST', { items })
  },
}
