'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Activity, ArrowUpRight, HeartPulse, Plus } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { exerciseCatalog, routineCatalog } from '@/lib/training/catalog'
import { formatDateString } from '@/lib/utils/date'
import type { TrainingRecord } from '@/lib/training/client'
import {
  defaultReadinessRules, discomfortRegions, discomfortSchema, getLocalTrainingDate,
  recommendReadiness, recoverySchema, readinessRulesSchema,
  type DiscomfortEntry, type ReadinessRules, type RecoveryCheckIn,
} from '@/lib/training/performance'
import { usePerformanceRecords } from './training-records'
import { fieldClass, FormError, LoadError } from './performance-shell'

const ratings = [
  ['sleepQuality', 'Sleep quality'], ['energy', 'Energy'], ['soreness', 'Muscle soreness'],
  ['stress', 'Stress'], ['motivation', 'Motivation'], ['fatigue', 'Fatigue'],
  ['discomfort', 'Discomfort'],
] as const

type RecoveryMeasure = typeof ratings[number][0] | 'sleepHours' | 'restingHeartRate' | 'heartRateVariability'

function CheckInForm({ date, initial, save, pending }: {
  date: string
  initial?: RecoveryCheckIn
  save: (value: RecoveryCheckIn) => Promise<unknown>
  pending: boolean
}) {
  const [draft, setDraft] = useState<RecoveryCheckIn>(initial ?? { date })
  const [error, setError] = useState('')
  const change = (field: RecoveryMeasure, value: string) => {
    setDraft((current) => ({ ...current, [field]: value === '' ? undefined : Number(value) }))
  }
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = recoverySchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Check-in saved')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the check-in.')
    }
  }

  return (
    <form className="space-y-4" onSubmit={submit}>
      <label className="block max-w-48 space-y-1 text-sm font-medium">
        <span>Sleep hours</span>
        <input className={fieldClass} type="number" inputMode="decimal" min="0" max="24" step="0.25" value={draft.sleepHours ?? ''} onChange={(event) => change('sleepHours', event.target.value)} />
      </label>
      <p className="text-sm text-muted-foreground">Rate each measure from 1 (low) to 5 (high). You can leave any field blank.</p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {ratings.map(([key, label]) => (
          <label key={key} className="space-y-1 text-sm font-medium">
            <span>{label}</span>
            <select className={fieldClass} value={draft[key] ?? ''} onChange={(event) => change(key, event.target.value)}>
              <option value="">Unrecorded</option>
              {[1, 2, 3, 4, 5].map((rating) => <option key={rating} value={rating}>{rating}</option>)}
            </select>
          </label>
        ))}
      </div>
      <details className="rounded-xl border border-border p-3">
        <summary className="cursor-pointer rounded-sm py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Heart metrics (optional)</summary>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm font-medium">
            <span>Resting heart rate (bpm)</span>
            <input className={fieldClass} type="number" inputMode="numeric" min="1" max="250" value={draft.restingHeartRate ?? ''} onChange={(event) => change('restingHeartRate', event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Heart rate variability (ms)</span>
            <input className={fieldClass} type="number" inputMode="decimal" min="0" max="500" step="0.1" value={draft.heartRateVariability ?? ''} onChange={(event) => change('heartRateVariability', event.target.value)} />
          </label>
        </div>
      </details>
      <FormError message={error} />
      <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save check-in'}</Button>
    </form>
  )
}

function ReadinessPanel({ rules, checkIn, save, pending }: {
  rules: ReadinessRules
  checkIn?: RecoveryCheckIn
  save: (value: ReadinessRules) => Promise<unknown>
  pending: boolean
}) {
  const [draft, setDraft] = useState(rules)
  const [error, setError] = useState('')
  const recommendation = recommendReadiness(checkIn, rules)

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = readinessRulesSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Readiness settings saved')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save readiness settings.')
    }
  }

  return (
    <Card className="self-start">
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Activity className="size-5 text-primary" /> Readiness</CardTitle>
        <CardDescription>Optional training suggestions based on your own thresholds.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {rules.enabled && (
          <div className="space-y-2 rounded-xl border border-primary/30 bg-primary/5 p-4">
            <p className="font-semibold">{recommendation.label}</p>
            <ul className="list-inside list-disc space-y-1 text-sm text-muted-foreground">
              {recommendation.reasons.map((reason) => <li key={reason}>{reason}</li>)}
            </ul>
            <p className="text-xs text-muted-foreground">Suggestions are for training planning. Seek professional advice about health concerns.</p>
          </div>
        )}
        <form className="space-y-3" onSubmit={submit}>
          <label className="flex min-h-11 items-center gap-2 text-sm font-medium">
            <input className="size-5 accent-primary" type="checkbox" checked={draft.enabled} onChange={(event) => setDraft((current) => ({ ...current, enabled: event.target.checked }))} />
            Show readiness suggestions
          </label>
          {draft.enabled && (
            <div className="grid gap-3">
              {([
                ['minimumSleepHours', 'Minimum sleep hours', 16, 0.25],
                ['maxSoreness', 'Maximum soreness (1–5)', 5, 1],
                ['maxFatigue', 'Maximum fatigue (1–5)', 5, 1],
              ] as const).map(([key, label, max, step]) => (
                <label className="space-y-1 text-sm font-medium" key={key}>
                  <span>{label}</span>
                  <input className={fieldClass} type="number" min="1" max={max} step={step} value={draft[key] || ''} required onChange={(event) => setDraft((current) => ({ ...current, [key]: Number(event.target.value) }))} />
                </label>
              ))}
            </div>
          )}
          <FormError message={error} />
          <Button type="submit" variant="outline" disabled={pending}>{pending ? 'Saving…' : 'Save preferences'}</Button>
        </form>
      </CardContent>
    </Card>
  )
}

function History({ records }: { records: TrainingRecord<RecoveryCheckIn>[] }) {
  const days = records.slice().sort((left, right) => right.data.date.localeCompare(left.data.date)).slice(0, 14)
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent check-ins</CardTitle>
        <CardDescription>Sleep, energy, soreness and fatigue across your last 14 entries.</CardDescription>
      </CardHeader>
      <CardContent>
        {days.length === 0 ? <p className="text-sm text-muted-foreground">Your saved check-ins will appear here.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-88 text-left text-sm">
              <thead className="text-muted-foreground">
                <tr><th scope="col" className="py-2">Date</th><th scope="col">Sleep</th><th scope="col">Energy</th><th scope="col">Soreness</th><th scope="col">Fatigue</th></tr>
              </thead>
              <tbody className="divide-y divide-border">
                {days.map(({ id, data }) => (
                  <tr key={id}>
                    <th scope="row" className="py-2 font-medium">{formatDateString(data.date)}</th>
                    <td>{data.sleepHours === undefined ? '—' : `${data.sleepHours} h`}</td>
                    <td>{data.energy ?? '—'}</td><td>{data.soreness ?? '—'}</td><td>{data.fatigue ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const diagramZones: { region: DiscomfortEntry['bodyRegion']; x: number; y: number; back?: boolean }[] = [
  { region: 'Neck', x: 110, y: 71 }, { region: 'Shoulders', x: 61, y: 104 },
  { region: 'Upper back', x: 110, y: 130, back: true }, { region: 'Elbows', x: 166, y: 149 },
  { region: 'Lower back', x: 110, y: 171, back: true }, { region: 'Wrists and hands', x: 36, y: 220 },
  { region: 'Hips and groin', x: 110, y: 211 }, { region: 'Thighs', x: 135, y: 258 },
  { region: 'Knees', x: 79, y: 306 }, { region: 'Calves', x: 137, y: 344, back: true },
  { region: 'Ankles and feet', x: 73, y: 380 },
]

function DiscomfortMap({ selected, onSelect }: { selected: DiscomfortEntry['bodyRegion']; onSelect: (region: DiscomfortEntry['bodyRegion']) => void }) {
  const [showBack, setShowBack] = useState(false)
  return (
    <div className="mx-auto w-full max-w-56 space-y-2">
      <div role="group" aria-label="Body map view" className="flex justify-center gap-2">
        <Button type="button" size="sm" aria-pressed={!showBack} variant={showBack ? 'outline' : 'secondary'} onClick={() => setShowBack(false)}>Front</Button>
        <Button type="button" size="sm" aria-pressed={showBack} variant={showBack ? 'secondary' : 'outline'} onClick={() => setShowBack(true)}>Back</Button>
      </div>
      <div className="relative rounded-2xl border border-border bg-muted/30">
        <Image className="block h-auto w-full" src={showBack ? '/training/body-back.svg' : '/training/body-front.svg'} alt="" width={220} height={440} />
        {diagramZones.filter((zone) => Boolean(zone.back) === showBack).map(({ region, x, y }) => (
          <button key={region} type="button" aria-pressed={region === selected} aria-label={region}
            title={region} className="absolute grid min-h-11 min-w-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full focus-visible:outline-2 focus-visible:outline-ring"
            style={{ left: `${x / 220 * 100}%`, top: `${y / 440 * 100}%` }} onClick={() => onSelect(region)}>
            <span className={`size-3 rounded-full border ${region === selected ? 'border-primary bg-primary' : 'border-foreground bg-background'}`} />
          </button>
        ))}
      </div>
    </div>
  )
}

function DiscomfortForm({ date, initial, save, pending, cancel, exercises }: {
  date: string
  initial?: DiscomfortEntry
  save: (value: DiscomfortEntry) => Promise<unknown>
  pending: boolean
  cancel: () => void
  exercises: { slug: string; name: string }[]
}) {
  const [draft, setDraft] = useState<DiscomfortEntry>(initial ?? {
    onsetDate: date, bodyRegion: 'Shoulders', side: 'both', severity: 1, status: 'ongoing', course: 'new', excludedExerciseSlugs: [],
  })
  const [error, setError] = useState('')
  const [exercise, setExercise] = useState('')

  const change = <K extends keyof DiscomfortEntry>(field: K, value: DiscomfortEntry[K]) => setDraft((current) => ({ ...current, [field]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = discomfortSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Discomfort entry saved')
      cancel()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the entry.')
    }
  }

  return (
    <form className="grid gap-6 rounded-xl border border-border p-4 md:grid-cols-[14rem_minmax(0,1fr)]" onSubmit={submit}>
      <DiscomfortMap selected={draft.bodyRegion} onSelect={(value) => change('bodyRegion', value)} />
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <label className="space-y-1 text-sm font-medium">
            <span>Body region</span>
            <select className={fieldClass} value={draft.bodyRegion} onChange={(event) => change('bodyRegion', event.target.value as DiscomfortEntry['bodyRegion'])}>
              {discomfortRegions.map((region) => <option key={region}>{region}</option>)}
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Side</span>
            <select className={fieldClass} value={draft.side} onChange={(event) => change('side', event.target.value as DiscomfortEntry['side'])}>
              <option value="left">Left</option><option value="right">Right</option>
              <option value="both">Both</option><option value="central">Central</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Started on</span>
            <input type="date" required max={date} className={fieldClass} value={draft.onsetDate} onChange={(event) => change('onsetDate', event.target.value)} />
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Severity</span>
            <select className={fieldClass} value={draft.severity} onChange={(event) => change('severity', Number(event.target.value))}>
              <option value="1">1 (mild)</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5 (severe)</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>How it is changing</span>
            <select className={fieldClass} value={draft.course ?? 'new'} onChange={(event) => change('course', event.target.value as DiscomfortEntry['course'])}>
              <option value="new">New</option><option value="improving">Improving</option><option value="persistent">Persistent</option><option value="worsening">Worsening</option>
            </select>
          </label>
          <label className="space-y-1 text-sm font-medium">
            <span>Status</span>
            <select className={fieldClass} value={draft.status} onChange={(event) => change('status', event.target.value as DiscomfortEntry['status'])}>
              <option value="ongoing">Ongoing</option><option value="resolved">Resolved</option>
            </select>
          </label>
        </div>
        {draft.status === 'ongoing' && (draft.severity >= 4 || draft.course === 'persistent' || draft.course === 'worsening') && (
          <p role="status" className="rounded-lg border border-destructive/40 p-3 text-sm">Consider professional assessment for severe, persistent or worsening symptoms.</p>
        )}
        <label className="block space-y-1 text-sm font-medium">
          <span>Associated activities (optional)</span>
          <input className={fieldClass} maxLength={200} value={draft.associatedActivities ?? ''} onChange={(event) => change('associatedActivities', event.target.value)} />
        </label>
        <label className="block space-y-1 text-sm font-medium">
          <span>Notes (optional)</span>
          <textarea className={`${fieldClass} min-h-20 py-2`} maxLength={1000} value={draft.notes ?? ''} onChange={(event) => change('notes', event.target.value)} />
        </label>
        <div className="space-y-2">
          <div className="flex items-end gap-2">
            <label className="min-w-0 flex-1 space-y-1 text-sm font-medium">
              <span>Exclude an exercise from suggestions</span>
              <select className={fieldClass} value={exercise} onChange={(event) => setExercise(event.target.value)}>
                <option value="">Select an exercise</option>
                {exercises.filter(({ slug }) => !draft.excludedExerciseSlugs.includes(slug)).map(({ slug, name }) => <option key={slug} value={slug}>{name}</option>)}
              </select>
            </label>
            <Button type="button" variant="outline" className="min-h-11" disabled={!exercise || draft.excludedExerciseSlugs.length >= 30} onClick={() => {
              change('excludedExerciseSlugs', [...draft.excludedExerciseSlugs, exercise])
              setExercise('')
            }}>Exclude</Button>
          </div>
          {draft.excludedExerciseSlugs.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {draft.excludedExerciseSlugs.map((slug) => (
                <li key={slug}>
                  <Button type="button" variant="secondary" size="sm" onClick={() => change('excludedExerciseSlugs', draft.excludedExerciseSlugs.filter((item) => item !== slug))}>
                    Remove {exercises.find((item) => item.slug === slug)?.name ?? slug}
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
        <FormError message={error} />
        <div className="flex gap-2">
          <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save entry'}</Button>
          <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
        </div>
      </div>
    </form>
  )
}

export function RecoveryWorkspace({ userId }: { userId: string }) {
  const recovery = usePerformanceRecords('recovery', userId)
  const preferences = usePerformanceRecords('preferences', userId)
  const discomfort = usePerformanceRecords('discomfort', userId)
  const customExercises = usePerformanceRecords('exercises', userId)
  const [editing, setEditing] = useState<'new' | TrainingRecord<DiscomfortEntry> | null>(null)
  const timeZone = preferences.query.data?.find(({ data }) => data.key === 'training')?.data.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const date = getLocalTrainingDate(new Date(), timeZone)
  const entry = recovery.query.data?.find(({ data }) => data.date === date)
  const readiness = preferences.query.data?.find(({ data }) => data.key === 'readiness')
  const routines = routineCatalog.filter((routine) => routine.category === 'recovery')
  const exercises = [
    ...exerciseCatalog.map(({ slug, name }) => ({ slug, name })),
    ...(customExercises.query.data ?? []).map(({ id, data }) => ({ slug: id, name: data.name })),
  ].sort((left, right) => left.name.localeCompare(right.name))

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><HeartPulse className="size-5 text-primary" /> Daily check-in</CardTitle>
            <CardDescription>{formatDateString(date)}</CardDescription>
          </CardHeader>
          <CardContent>
            {recovery.query.isPending || preferences.query.isPending ? <p role="status">Loading your check-in…</p> : recovery.query.isError || preferences.query.isError ? (
              <LoadError onRetry={() => { void recovery.query.refetch(); void preferences.query.refetch() }}>Could not load your check-in.</LoadError>
            ) : (
              <CheckInForm key={`${date}-${entry?.version ?? 'new'}`} date={date} initial={entry?.data} pending={recovery.save.isPending}
                save={(data) => recovery.save.mutateAsync({ data, previous: entry })} />
            )}
          </CardContent>
        </Card>
        {preferences.query.isSuccess && (
          <ReadinessPanel key={readiness?.version ?? 'new'} rules={readiness?.data.readiness ?? defaultReadinessRules} checkIn={entry?.data} pending={preferences.save.isPending}
            save={(rules) => preferences.save.mutateAsync({ data: { key: 'readiness', readiness: rules }, previous: readiness })} />
        )}
      </div>

      <Card id="discomfort" className="scroll-mt-24">
        <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <CardTitle>Discomfort journal</CardTitle>
            <CardDescription>Keep a private history and exclude exercises from your suggestions.</CardDescription>
          </div>
          {discomfort.query.isSuccess && <Button type="button" variant="outline" onClick={() => setEditing('new')}><Plus className="size-4" /> Add entry</Button>}
        </CardHeader>
        <CardContent className="space-y-4">
          {discomfort.query.isError && <LoadError onRetry={() => void discomfort.query.refetch()}>Could not load your discomfort entries.</LoadError>}
          {discomfort.query.isPending && <p role="status">Loading your discomfort entries…</p>}
          {editing && (
            <DiscomfortForm key={editing === 'new' ? 'new' : editing.id} date={date} initial={editing === 'new' ? undefined : editing.data} pending={discomfort.save.isPending}
              cancel={() => setEditing(null)} exercises={exercises} save={(data) => discomfort.save.mutateAsync({ data, previous: editing === 'new' ? undefined : editing })} />
          )}
          {discomfort.query.data?.length === 0 && !editing && <p className="text-sm text-muted-foreground">No discomfort entries yet.</p>}
          {discomfort.query.data && discomfort.query.data.length > 0 && (
            <ul className="divide-y divide-border">
              {discomfort.query.data.map((record) => (
                <li key={record.id} className="flex flex-wrap items-start justify-between gap-2 py-3">
                  <div>
                    <p className="font-medium">{record.data.bodyRegion} <span className="text-sm text-muted-foreground">({record.data.side})</span></p>
                    <p className="text-sm text-muted-foreground">{formatDateString(record.data.onsetDate)} · {record.data.status} · {record.data.severity}/5</p>
                  </div>
                  <Button type="button" variant="ghost" onClick={() => setEditing(record)}>Edit <span className="sr-only">{record.data.bodyRegion} entry</span></Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      {recovery.query.data && <History records={recovery.query.data} />}

      <section aria-labelledby="rec-routines" className="space-y-3">
        <h2 id="rec-routines" className="text-xl font-semibold">Recovery routines</h2>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {routines.map((routine) => (
            <Link key={routine.slug} href={`/training/recovery?template=${encodeURIComponent(routine.slug)}`}
              className="group rounded-2xl border border-border bg-card p-4 focus-visible:outline-2 focus-visible:outline-ring hover:border-primary/70">
              <p className="flex items-center justify-between gap-3 font-medium">{routine.name}<ArrowUpRight className="size-4 shrink-0 text-primary" aria-hidden="true" /></p>
              <p className="mt-1 text-sm text-muted-foreground">{routine.durationMinutes} min · {routine.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}
