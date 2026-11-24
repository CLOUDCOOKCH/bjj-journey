'use client'

import { useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { get, patch } from '@/lib/api/client'
import { journalEntryKeys } from '@/lib/hooks/use-journal-entries'
import { useReviewTechniques } from '@/lib/hooks/use-review-techniques'
import { journalDetailsSchema, type JournalDetails } from '@/lib/validations/journal-details'

type RecordDetails = JournalDetails & { entryDate: string; title: string | null }

const numberFields = [
  { key: 'sparringRounds', label: 'Sparring rounds', max: 500 },
  { key: 'sparringMinutes', label: 'Total sparring minutes', max: 480 },
  { key: 'roundMinutes', label: 'Minutes per round', max: 120 },
  { key: 'submissionsPerformed', label: 'Submissions performed', max: 500 },
  { key: 'submissionsReceived', label: 'Submissions received', max: 500 },
  { key: 'postSessionFatigue', label: 'Post-session fatigue (0–10)', max: 10 },
] as const

const textFields = [
  { key: 'positionalSparring', label: 'Positional sparring' },
  { key: 'positionsTrained', label: 'Positions trained' },
  { key: 'trainingFocus', label: 'Training focus' },
  { key: 'successfulTechniques', label: 'Techniques that worked' },
  { key: 'techniquesToImprove', label: 'Techniques to practise' },
  { key: 'observations', label: 'Personal observations' },
] as const

export function JournalDetailsForm({ id }: { id: string }) {
  const endpoint = `/api/journal-entries/${encodeURIComponent(id)}/details`
  const formData = useQuery({
    queryKey: [...journalEntryKeys.detail(id), 'training-details'],
    queryFn: () => get<RecordDetails>(endpoint),
  })
  if (formData.isPending) return <p role="status">Loading session…</p>
  if (formData.isError) return <p role="alert">{formData.error.message}</p>
  return <DetailsEditor key={id} id={id} data={formData.data} endpoint={endpoint} />
}

function DetailsEditor({ id, data, endpoint }: { id: string; data: RecordDetails; endpoint: string }) {
  const queryClient = useQueryClient()
  const techniques = useReviewTechniques({})
  const [linkedIds, setLinkedIds] = useState(data.techniqueIds)
  const [error, setError] = useState('')
  const mutation = useMutation({
    mutationFn: (values: JournalDetails) => patch<RecordDetails>(endpoint, values),
    onSuccess: (record) => {
      queryClient.setQueryData([...journalEntryKeys.detail(id), 'training-details'], record)
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: ['training', 'journal'] })
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    const form = new FormData(event.currentTarget)
    const details = Object.fromEntries([
      ...numberFields.flatMap(({ key }) => {
        const value = form.get(key)
        return value === '' || value === null ? [] : [[key, Number(value)]]
      }),
      ...textFields.map(({ key }) => [key, String(form.get(key) ?? '')]),
    ])
    const result = journalDetailsSchema.safeParse({
      sessionRpe: form.get('rpe') === '' ? null : Number(form.get('rpe')),
      details, techniqueIds: linkedIds,
    })
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Review the session details.')
      return
    }
    mutation.mutate(result.data)
  }

  return (
    <form onSubmit={submit} className="max-w-3xl space-y-8">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">{data.title || 'Training session'}</h2>
        <p className="text-sm text-muted-foreground">{data.entryDate}</p>
      </div>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">Rounds and effort</legend>
        <label className="space-y-1 text-sm font-medium">Session RPE (0–10)
          <Input name="rpe" type="number" min={0} max={10} defaultValue={data.sessionRpe ?? ''} />
        </label>
        {numberFields.map(({ key, label, max }) => (
          <label key={key} className="space-y-1 text-sm font-medium">{label}
            <Input name={key} type="number" min={0} max={max} defaultValue={data.details[key] ?? ''} />
          </label>
        ))}
      </fieldset>
      <fieldset className="grid gap-4 sm:grid-cols-2">
        <legend className="mb-3 text-lg font-semibold">What you practised</legend>
        {textFields.map(({ key, label }) => (
          <label key={key} className="space-y-1 text-sm font-medium">{label}
            <Textarea name={key} maxLength={2000} defaultValue={data.details[key] ?? ''} />
          </label>
        ))}
      </fieldset>
      <fieldset className="space-y-2">
        <legend className="mb-3 text-lg font-semibold">Personal technique library</legend>
        {techniques.isPending && <p role="status">Loading techniques…</p>}
        {techniques.isError && <p role="alert">Your technique library is unavailable. Existing links will be kept.</p>}
        {techniques.data?.length === 0 && <p className="text-sm text-muted-foreground">Save a technique in your library to link it here.</p>}
        <div className="max-h-56 overflow-y-auto">
          {techniques.data?.map(technique => (
            <label className="flex min-h-11 items-center gap-3 px-1 text-sm" key={technique.id}>
              <input type="checkbox" checked={linkedIds.includes(technique.id)} onChange={event => {
                const checked = event.currentTarget.checked
                setLinkedIds(ids => checked ? [...ids, technique.id] : ids.filter(id => id !== technique.id))
              }} />
              {technique.name}
            </label>
          ))}
        </div>
      </fieldset>
      {(error || mutation.error) && <p role="alert" className="text-sm text-destructive">{error || mutation.error?.message}</p>}
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Saving…' : 'Save reflection'}</Button>
        {mutation.isSuccess && <p role="status" className="text-sm">Session reflection saved.</p>}
      </div>
    </form>
  )
}
