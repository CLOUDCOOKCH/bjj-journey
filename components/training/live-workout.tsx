'use client'

import Link from 'next/link'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Check, Maximize2, Pause, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useReviewTechniques } from '@/lib/hooks/use-review-techniques'
import { trainingClient } from '@/lib/training/client'
import { categoryLabels, clockLabel, fromKilograms, pauseWorkout, resumeWorkout, workoutElapsed, type WeightUnit, type WorkoutSession } from '@/lib/training/workouts'
import { useWorkoutDraft } from '@/lib/training/workout-draft'
import { GuidedWorkout } from './guided-workout'
import { StrengthWorkout } from './strength-workout'
import { NumberField } from './workout-fields'

export function LiveWorkout({ userId, id }: { userId: string; id: string }) {
  const workout = useWorkoutDraft(userId, id)
  const [now, setNow] = useState(0)
  const [reviewing, setReviewing] = useState(false)
  const [finishing, setFinishing] = useState(false)
  const [finishError, setFinishError] = useState('')
  const [wake, setWake] = useState(false)
  const [displayError, setDisplayError] = useState('')
  const lock = useRef<WakeLockSentinel | null>(null)
  const surface = useRef<HTMLElement>(null)
  const unitsQuery = useQuery({
    queryKey: ['training', 'preferences', 'library', userId],
    queryFn: ({ signal }) => trainingClient.list<{ key: string; weightUnit?: WeightUnit }>('preferences', signal),
  })
  const preferences = unitsQuery.data?.find(record => record.data.key === 'training')?.data
  const legacyUnits = unitsQuery.data?.find(record => record.data.key === 'units')?.data
  const unit = preferences?.weightUnit ?? legacyUnits?.weightUnit ?? 'kg'

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(timer)
  }, [])

  const acquireWakeLock = useCallback(async () => {
    if (!navigator.wakeLock) { setDisplayError('This browser does not support screen wake lock.'); setWake(false); return }
    try {
      const next = await navigator.wakeLock.request('screen')
      lock.current = next
      setWake(true)
      setDisplayError('')
    } catch {
      setWake(false)
      setDisplayError('Could not keep the screen awake on this device.')
    }
  }, [])

  useEffect(() => {
    const updateWake = () => {
      if (wake && document.visibilityState === 'visible' && (!lock.current || lock.current.released)) void acquireWakeLock()
    }
    document.addEventListener('visibilitychange', updateWake)
    return () => document.removeEventListener('visibilitychange', updateWake)
  }, [acquireWakeLock, wake])

  useEffect(() => () => { void lock.current?.release().catch(() => undefined) }, [])

  async function toggleWake() {
    if (wake) {
      await lock.current?.release().catch(() => undefined)
      setWake(false)
      lock.current = null
    } else {
      await acquireWakeLock()
    }
  }

  async function fullScreen() {
    setDisplayError('')
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else if (surface.current?.requestFullscreen) await surface.current.requestFullscreen()
      else setDisplayError('Full screen is unavailable in this browser.')
    } catch {
      setDisplayError('Full screen could not be opened.')
    }
  }

  function review() {
    workout.edit(data => {
      const paused = pauseWorkout(data, Date.now())
      return { ...paused, durationMinutes: data.durationMinutes ?? Math.max(1, Math.round(paused.elapsedSeconds / 60)) }
    })
    setReviewing(true)
    setFinishError('')
  }

  async function finish(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (finishing || !workout.online || workout.conflict) return
    if (!workout.data?.durationMinutes) { setFinishError('Enter the session duration in minutes.'); return }
    if (workout.data.averageHeartRate != null && workout.data.maximumHeartRate != null &&
      workout.data.averageHeartRate > workout.data.maximumHeartRate) {
      setFinishError('Maximum heart rate must equal or exceed average heart rate.')
      return
    }
    setFinishing(true)
    setFinishError('')
    try {
      await workout.finish()
      setReviewing(false)
      void lock.current?.release().catch(() => undefined)
      setWake(false)
      lock.current = null
    } catch (caught) {
      setFinishError(caught instanceof Error ? caught.message : 'Could not complete your workout.')
    } finally {
      setFinishing(false)
    }
  }

  if (workout.error || workout.loading || !workout.data) {
    return <main className="mx-auto max-w-2xl p-6">
      <Link href="/training" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground"><ArrowLeft aria-hidden className="size-4" /> Training</Link>
      {workout.error ? <div className="space-y-3">
        <h1 className="text-2xl font-semibold">Workout unavailable</h1><p role="alert">{workout.error.message}</p>
        <Button type="button" className="min-h-11" variant="outline" onClick={() => void workout.retry()}>Retry</Button>
      </div> : <p role="status" className="text-muted-foreground">Opening workout…</p>}
    </main>
  }

  const data = workout.data
  const status = !workout.online ? 'Offline · edits stay on this device'
    : workout.conflict ? 'Sync conflict'
    : workout.saving ? 'Saving…' : workout.hasPendingChanges ? 'Changes waiting to sync' : 'Saved'

  return (
    <main ref={surface} className="min-h-dvh overflow-auto bg-background">
      <div className="mx-auto max-w-3xl space-y-6 px-4 pb-12 pt-4 sm:px-8 sm:pt-8">
        <header className="space-y-4 border-b border-border pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link href={`/training/${data.category}`} className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft aria-hidden className="size-4" /> {categoryLabels[data.category]}</Link>
            <Button asChild type="button" variant="ghost" className="min-h-11"><Link href="/calendar">Calendar</Link></Button>
          </div>
          <div className="flex flex-wrap items-end justify-between gap-2">
            <h1 className="max-w-full break-words text-3xl font-semibold tracking-tight sm:text-4xl">{data.title}</h1>
            <p className="text-sm text-muted-foreground" role="status">{data.status === 'completed' ? 'Completed' : status}</p>
          </div>
        </header>
        {data.status === 'completed' ? <WorkoutSummary data={data} unit={unit} /> : (
          <>
            {workout.storageError && <p role="alert" className="text-sm text-destructive">{workout.storageError}</p>}
            {workout.conflict && <section aria-label="Workout changes conflict" className="space-y-3 rounded-xl border border-destructive/60 p-4">
              <p role="alert">This workout changed in another tab or device. Choose which full version to keep.</p>
              <div className="flex flex-wrap gap-2">
                <Button type="button" className="min-h-11" disabled={!workout.online} onClick={() => void workout.resolve(true)}>Keep this device’s edits</Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={!workout.online} onClick={() => void workout.resolve(false)}>Use server version</Button>
              </div>
            </section>}
            {workout.saveError && !workout.conflict && <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/60 p-3">
              <p className="text-sm text-destructive" role="alert">{workout.saveError}</p>
              <Button type="button" className="min-h-11" variant="outline" disabled={!workout.online || workout.saving} onClick={() => void workout.sync().catch(() => undefined)}>Retry sync</Button>
            </div>}
            {reviewing ? <form onSubmit={finish} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
              <h2 className="text-2xl font-semibold">Review workout</h2>
              <p className="text-sm text-muted-foreground">Confirm your session details before saving it to your history.</p>
              <fieldset disabled={finishing} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <NumberField label="Duration (min)" value={data.durationMinutes} min={1} max={1440} change={durationMinutes => workout.edit(workout => ({ ...workout, durationMinutes }))} />
                  <NumberField label="Session RPE (0–10, optional)" value={data.sessionRpe} max={10} step={0.5} change={sessionRpe => workout.edit(workout => ({ ...workout, sessionRpe }))} />
                  {data.category === 'conditioning' && <>
                    <NumberField label="Distance (km, optional)" value={data.distanceKm} max={1000} step={0.01} change={distanceKm => workout.edit(workout => ({ ...workout, distanceKm }))} />
                    <NumberField label="Average heart rate (optional)" value={data.averageHeartRate} min={20} max={250} change={averageHeartRate => workout.edit(workout => ({ ...workout, averageHeartRate }))} />
                    <NumberField label="Maximum heart rate (optional)" value={data.maximumHeartRate} min={20} max={250} change={maximumHeartRate => workout.edit(workout => ({ ...workout, maximumHeartRate }))} />
                  </>}
                </div>
                {data.category === 'solo' && <SoloTechniqueLinks data={data} update={reviewTechniqueIds => workout.edit(workout => ({ ...workout, reviewTechniqueIds }))} />}
                <Label className="grid gap-2">Notes<Textarea value={data.notes ?? ''} maxLength={4000} onChange={event => workout.edit(workout => ({ ...workout, notes: event.target.value }))} /></Label>
              </fieldset>
              {!workout.online && <p role="status" className="text-sm text-muted-foreground">Reconnect to complete your workout.</p>}
              {finishError && <p role="alert" className="text-sm text-destructive">{finishError}</p>}
              <div className="flex flex-wrap gap-2">
                <Button type="submit" className="min-h-11" disabled={!workout.online || finishing || workout.conflict}><Check aria-hidden /> {finishing ? 'Completing…' : 'Complete workout'}</Button>
                <Button type="button" variant="outline" className="min-h-11" disabled={finishing} onClick={() => setReviewing(false)}>Back to workout</Button>
              </div>
            </form> : <>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p aria-label="Total workout time" className="text-2xl font-semibold tabular-nums">{clockLabel(workoutElapsed(data, now))}</p>
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={() => workout.edit(workout => workout.pausedAt ? resumeWorkout(workout, Date.now()) : pauseWorkout(workout, Date.now()))}>
                    {data.pausedAt ? <><Play aria-hidden /> Resume</> : <><Pause aria-hidden /> Pause</>}
                  </Button>
                  <Button type="button" variant="outline" size="sm" className="min-h-11" aria-pressed={wake} onClick={toggleWake}>Keep awake</Button>
                  <Button type="button" variant="outline" size="icon" className="size-11" aria-label="Toggle full screen" onClick={fullScreen}><Maximize2 aria-hidden /></Button>
                </div>
              </div>
              {displayError && <p className="text-sm text-muted-foreground" role="status">{displayError}</p>}
              {data.category === 'strength'
                ? <StrengthWorkout data={data} now={now} userId={userId} edit={workout.edit} unit={unit} />
                : <GuidedWorkout data={data} now={now} edit={workout.edit} review={review} />}
              {(data.category === 'strength' || (data.currentStep ?? 0) < data.exercises.length) && <div className="flex justify-end"><Button type="button" className="min-h-12" onClick={review}>Review workout</Button></div>}
            </>}
          </>
        )}
      </div>
    </main>
  )
}

function SoloTechniqueLinks({ data, update }: { data: WorkoutSession; update: (ids: string[]) => void }) {
  const techniques = useReviewTechniques()
  const linked = data.reviewTechniqueIds ?? []
  return (
    <fieldset className="space-y-2 rounded-lg border border-border px-3 pb-3">
      <legend className="px-2 text-sm font-medium">Personal techniques</legend>
      {techniques.isPending && <p role="status" className="text-sm text-muted-foreground">Loading techniques…</p>}
      {techniques.isError && <p role="alert" className="text-sm text-destructive">Could not load personal techniques.</p>}
      {techniques.isSuccess && !techniques.data.length && <p className="text-sm text-muted-foreground">Add techniques to your personal library to link them here.</p>}
      <div className="max-h-36 overflow-y-auto">
        {techniques.data?.map(technique => <label key={technique.id} className="flex min-h-10 items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-primary" checked={linked.includes(technique.id)} onChange={event => update(event.target.checked ? [...linked, technique.id] : linked.filter(id => id !== technique.id))} />
          {technique.name}
        </label>)}
      </div>
    </fieldset>
  )
}

function WorkoutSummary({ data, unit }: { data: WorkoutSession; unit: WeightUnit }) {
  const sets = data.exercises.flatMap(step => step.sets ?? []).filter(set => set.completed)
  return (
    <section aria-labelledby="workout-completed" className="space-y-5 rounded-xl border border-border bg-card p-5 sm:p-7">
      <h2 id="workout-completed" className="flex items-center gap-2 text-2xl font-semibold"><Check aria-hidden className="text-primary" /> Workout saved</h2>
      <dl className="grid grid-cols-2 gap-3">
        <div><dt className="text-sm text-muted-foreground">Duration</dt><dd className="text-lg font-medium">{data.durationMinutes ?? '—'}{data.durationMinutes !== undefined && ' min'}</dd></div>
        <div><dt className="text-sm text-muted-foreground">Session RPE</dt><dd className="text-lg font-medium">{data.sessionRpe ?? 'Not recorded'}</dd></div>
        {data.category === 'strength' && <div><dt className="text-sm text-muted-foreground">Completed sets</dt><dd className="text-lg font-medium">{sets.length}</dd></div>}
        {data.distanceKm !== undefined && <div><dt className="text-sm text-muted-foreground">Distance</dt><dd className="text-lg font-medium">{data.distanceKm} km</dd></div>}
        {data.averageHeartRate !== undefined && <div><dt className="text-sm text-muted-foreground">Average heart rate</dt><dd className="text-lg font-medium">{data.averageHeartRate} bpm</dd></div>}
        {data.maximumHeartRate !== undefined && <div><dt className="text-sm text-muted-foreground">Maximum heart rate</dt><dd className="text-lg font-medium">{data.maximumHeartRate} bpm</dd></div>}
      </dl>
      {!!data.exercises.length && <ul className="divide-y divide-border text-sm">
        {data.exercises.map((step, index) => {
          const loggedSets = step.sets?.filter(set => set.completed)
          return <li className="space-y-1 py-2" key={`${step.exerciseSlug}-${index}`}>
            <div className="flex justify-between gap-2">
              <span className="font-medium">{step.name}</span>
              <span className="text-muted-foreground">{data.skipped?.includes(index) ? 'Skipped'
                : loggedSets ? `${loggedSets.length} sets`
                  : step.repetitionsCompleted !== undefined ? `${step.repetitionsCompleted} reps`
                    : index >= (data.currentStep ?? 0) ? 'Not recorded' : 'Done'}</span>
            </div>
            {!!loggedSets?.length && <p className="text-xs text-muted-foreground">
              {loggedSets.map(set => [
                set.kind === 'warmup' ? 'Warm-up' : null,
                set.weightKg === undefined ? null : `${Math.round(fromKilograms(set.weightKg, unit) * 100) / 100} ${unit}`,
                set.repetitions === undefined ? null : `${set.repetitions} reps`,
                set.holdSeconds === undefined ? null : `${set.holdSeconds}s hold`,
              ].filter(Boolean).join(' · ')).filter(Boolean).join(' / ')}
            </p>}
            {step.notes && <p className="whitespace-pre-wrap text-xs text-muted-foreground">{step.notes}</p>}
          </li>
        })}
      </ul>}
      {data.notes && <p className="whitespace-pre-wrap text-sm text-muted-foreground">{data.notes}</p>}
      <div className="flex flex-wrap gap-2">
        <Button asChild className="min-h-11"><Link href="/calendar">View calendar</Link></Button>
        <Button asChild className="min-h-11" variant="outline"><Link href={`/training/${data.category}`}>Back to {categoryLabels[data.category].toLowerCase()}</Link></Button>
      </div>
    </section>
  )
}
