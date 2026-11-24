'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarDays, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { trainingClient, type TrainingRecord } from '@/lib/training/client'
import { dateInZone } from '@/lib/training/plan'
import { trainingSchemas, type TrainingData } from '@/lib/training/schemas'

type Competition = TrainingData<'competitions'>
const datePrefix = ['training', 'competitions']

export function CompetitionPlanner() {
  const client = useQueryClient()
  const events = useQuery({
    queryKey: datePrefix,
    queryFn: ({ signal }) => trainingClient.list<Competition>('competitions', signal),
  })
  const preferences = useQuery({
    queryKey: ['training', 'preferences'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'preferences'>>('preferences', signal),
  })
  const [editing, setEditing] = useState<string | 'new' | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const zone = preferences.data?.find(item => item.data.key === 'training')?.data.timeZone || Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = dateInZone(new Date(), zone)
  const record = events.data?.find(item => item.id === editing)
  const remove = useMutation({
    mutationFn: (item: TrainingRecord<Competition>) => trainingClient.remove('competitions', item.id, item.version),
    onSuccess: (_, item) => {
      if (editing === item.id) setEditing(null)
      setDeleteId(null)
      client.invalidateQueries({ queryKey: datePrefix })
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setEditing('new')}><Plus /> Add competition</Button>
        <Button asChild variant="outline"><Link href="/programmes">Plan preparation</Link></Button>
      </div>
      {events.isPending && <p role="status">Loading competitions…</p>}
      {events.isError && <p role="alert" className="text-destructive">{events.error.message}</p>}
      {events.data?.length === 0 && editing !== 'new' && <p className="text-muted-foreground">Add an event to track your preparation and reflect after competing.</p>}
      {events.data && events.data.length > 0 && (
        <ul className="divide-y rounded-xl border bg-card">
          {[...events.data].sort((a, b) => a.data.date.localeCompare(b.data.date)).map(item => {
            const days = Math.round((Date.parse(item.data.date) - Date.parse(today)) / 86_400_000)
            const checklist = item.data.checklist
            return (
              <li key={item.id} className="flex flex-wrap items-start justify-between gap-3 px-4 py-4 sm:px-5">
                <div className="min-w-0">
                  <h2 className="break-words font-semibold">{item.data.name}</h2>
                  <p className="mt-1 flex flex-wrap items-center gap-x-2 text-sm text-muted-foreground">
                    <CalendarDays size={16} aria-hidden="true" />
                    <time dateTime={item.data.date}>{item.data.date}</time>
                    <span>{item.data.discipline === 'gi' ? 'Gi' : 'No-Gi'}</span>
                    <span>{days > 0 ? `${days} days to go` : days === 0 ? 'Today' : 'Past event'}</span>
                  </p>
                  {Boolean(checklist?.length) && <p className="mt-1 text-sm text-muted-foreground">{checklist?.filter(task => task.done).length} of {checklist?.length} checklist items done</p>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant="outline" onClick={() => setEditing(item.id)}>{days >= 0 ? 'Edit preparation' : 'Review event'}</Button>
                  {deleteId === item.id ? (
                    <>
                      <Button variant="destructive" disabled={remove.isPending} onClick={() => remove.mutate(item)}>Confirm delete</Button>
                      <Button variant="ghost" onClick={() => setDeleteId(null)}>Cancel</Button>
                    </>
                  ) : <Button size="icon" variant="ghost" aria-label={`Delete ${item.data.name}`} onClick={() => setDeleteId(item.id)}><Trash2 /></Button>}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {remove.error && <p role="alert" className="text-destructive">{remove.error.message}</p>}
      {editing && <CompetitionForm key={editing} record={record} today={today} onClose={() => setEditing(null)} />}
    </div>
  )
}

function CompetitionForm({ record, today, onClose }: {
  record?: TrainingRecord<Competition>
  today: string
  onClose: () => void
}) {
  const client = useQueryClient()
  const [tasks, setTasks] = useState<NonNullable<Competition['checklist']>>(record?.data.checklist ?? [])
  const [error, setError] = useState('')
  const save = useMutation({
    mutationFn: (data: Competition) => record
      ? trainingClient.update('competitions', record.id, record.version, data)
      : trainingClient.create('competitions', data),
    onSuccess: () => {
      client.invalidateQueries({ queryKey: datePrefix })
      onClose()
    },
  })

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const text = (field: string) => String(form.get(field) ?? '')
    const parsed = trainingSchemas.competitions.safeParse({
      name: text('name'), date: text('date'), discipline: text('discipline'),
      weightClass: text('weightClass'), ruleSet: text('ruleSet'),
      matchMinutes: text('matchMinutes') ? Number(text('matchMinutes')) : undefined,
      goals: text('goals'), blocks: text('blocks'), reflection: text('reflection'),
      checklist: tasks.filter(task => task.text.trim()),
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Review your event details.')
      return
    }
    setError('')
    save.mutate(parsed.data)
  }

  return (
    <form className="max-w-3xl space-y-5 border-t pt-6" onSubmit={submit}>
      <h2 className="text-xl font-semibold">{record ? 'Edit competition' : 'New competition'}</h2>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm font-medium">Event name
          <Input className="mt-1" name="name" defaultValue={record?.data.name} required maxLength={200} />
        </label>
        <label className="text-sm font-medium">Date
          <Input className="mt-1" name="date" type="date" defaultValue={record?.data.date ?? today} required />
        </label>
        <label className="text-sm font-medium">Division
          <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3" name="discipline" defaultValue={record?.data.discipline ?? 'gi'}>
            <option value="gi">Gi</option><option value="no-gi">No-Gi</option>
          </select>
        </label>
        <label className="text-sm font-medium">Weight class (optional)
          <Input className="mt-1" name="weightClass" defaultValue={record?.data.weightClass} maxLength={100} />
        </label>
        <label className="text-sm font-medium">Rule set (optional)
          <Input className="mt-1" name="ruleSet" defaultValue={record?.data.ruleSet} maxLength={200} />
        </label>
        <label className="text-sm font-medium">Match length in minutes (optional)
          <Input className="mt-1" name="matchMinutes" type="number" min={1} max={120} defaultValue={record?.data.matchMinutes} />
        </label>
      </div>
      <label className="block text-sm font-medium">Preparation goals
        <Textarea className="mt-1" name="goals" maxLength={4000} defaultValue={record?.data.goals} />
      </label>
      <label className="block text-sm font-medium">Technical, physical and taper training blocks
        <Textarea className="mt-1" name="blocks" maxLength={4000} defaultValue={record?.data.blocks} />
      </label>
      <fieldset className="space-y-2">
        <legend className="mb-2 text-sm font-medium">Competition checklist</legend>
        {tasks.map((task, index) => (
          <div key={index} className="flex items-center gap-3">
            <input type="checkbox" checked={task.done} aria-label={`Complete checklist item ${index + 1}`} onChange={event => {
              const done = event.target.checked
              setTasks(items => items.map((item, row) => row === index ? { ...item, done } : item))
            }} />
            <Input aria-label={`Checklist item ${index + 1}`} value={task.text} maxLength={200} onChange={event => {
              const text = event.target.value
              setTasks(items => items.map((item, row) => row === index ? { ...item, text } : item))
            }} />
            <Button size="icon" variant="ghost" aria-label={`Remove checklist item ${index + 1}`} type="button" onClick={() => setTasks(items => items.filter((_, row) => row !== index))}><Trash2 /></Button>
          </div>
        ))}
        <Button type="button" variant="outline" disabled={tasks.length === 60} onClick={() => setTasks(items => [...items, { text: '', done: false }])}><Plus /> Add checklist item</Button>
      </fieldset>
      <label className="block text-sm font-medium">Post-competition reflection
        <Textarea className="mt-1" name="reflection" maxLength={4000} defaultValue={record?.data.reflection} />
      </label>
      {(error || save.error) && <p className="text-sm text-destructive" role="alert">{error || save.error?.message}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={save.isPending}>{save.isPending ? 'Saving…' : 'Save competition'}</Button>
        <Button variant="outline" type="button" onClick={onClose}>Cancel</Button>
      </div>
    </form>
  )
}
