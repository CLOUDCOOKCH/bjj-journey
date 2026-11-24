'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trainingClient, type TrainingRecord } from '@/lib/training/client'
import { dateInZone, isoWeekStart } from '@/lib/training/plan'
import { trainingSchemas, type TrainingData } from '@/lib/training/schemas'

type Reflection = TrainingData<'reflections'>
const queryKey = ['training', 'reflections']
const fields = [
  ['improved', 'What improved this week?'],
  ['difficulties', 'What caused difficulties?'],
  ['focus', 'What should I focus on next week?'],
  ['physical', 'How did I feel physically?'],
] as const

export function WeeklyReflections() {
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone
  const [date, setDate] = useState('')
  const query = useQuery({
    queryKey,
    queryFn: ({ signal }) => trainingClient.list<Reflection>('reflections', signal),
  })
  const preferences = useQuery({
    queryKey: ['training', 'preferences'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'preferences'>>('preferences', signal),
  })
  const selectedDate = date || dateInZone(new Date(), preferences.data?.find(item => item.data.key === 'training')?.data.timeZone || timezone)
  const week = isoWeekStart(selectedDate)
  const record = query.data?.find(item => item.data.weekStart === week)

  return (
    <div className="max-w-2xl space-y-6">
      <label className="block max-w-52 text-sm font-medium">Choose any date in the week
        <Input className="mt-1" type="date" value={selectedDate} min="1900-01-01" max="9999-12-31" onChange={event => setDate(event.target.value)} />
      </label>
      <p className="text-sm text-muted-foreground">Week starting {week}</p>
      {query.isPending && <p role="status">Loading reflections…</p>}
      {query.isError && <p role="alert" className="text-destructive">{query.error.message}</p>}
      {query.isSuccess && <ReflectionForm key={week} week={week} record={record} />}
      {query.data && query.data.length > 0 && (
        <section className="border-t pt-5">
          <h2 className="font-semibold">Previous reflections</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {[...query.data].sort((a, b) => b.data.weekStart.localeCompare(a.data.weekStart)).map(item =>
              <Button key={item.id} variant="outline" onClick={() => setDate(item.data.weekStart)}>{item.data.weekStart}</Button>
            )}
          </div>
        </section>
      )}
    </div>
  )
}

function ReflectionForm({ week, record }: { week: string; record?: TrainingRecord<Reflection> }) {
  const client = useQueryClient()
  const mutation = useMutation({
    mutationFn: (data: Reflection) => record
      ? trainingClient.update('reflections', record.id, record.version, data)
      : trainingClient.create('reflections', data),
    onSuccess: result => client.setQueryData<TrainingRecord<Reflection>[]>(queryKey, previous =>
      [result, ...(previous?.filter(item => item.id !== result.id) ?? [])]
    ),
    onError: () => client.invalidateQueries({ queryKey }),
  })
  const [error, setError] = useState('')

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const parsed = trainingSchemas.reflections.safeParse({
      weekStart: week,
      ...Object.fromEntries(fields.map(([key]) => [key, String(data.get(key) ?? '')])),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Review your reflection.')
      return
    }
    setError('')
    mutation.mutate(parsed.data)
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      {fields.map(([key, label]) => (
        <label key={key} className="block text-sm font-medium">{label}
          <Textarea name={key} className="mt-1" defaultValue={record?.data[key]} maxLength={4000} />
        </label>
      ))}
      {(error || mutation.error) && <p role="alert" className="text-sm text-destructive">{error || mutation.error?.message}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save weekly reflection'}</Button>
        {mutation.isSuccess && <p role="status" className="text-sm">Reflection saved.</p>}
      </div>
    </form>
  )
}
