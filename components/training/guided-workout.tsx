'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, SkipForward, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCatalogExercise } from '@/lib/training/catalog'
import { advanceConditioningAt, advanceGuided, blockElapsed, clockLabel, type WorkoutSession } from '@/lib/training/workouts'
import { NumberField, StepNotes } from './workout-fields'

export function GuidedWorkout({ data, now, edit, review }: {
  data: WorkoutSession
  now: number
  edit: (change: (workout: WorkoutSession) => WorkoutSession) => void
  review: () => void
}) {
  const current = data.currentStep ?? 0
  const exercise = data.exercises[current]
  const duration = data.resting ? exercise?.restSeconds : exercise?.durationSeconds
  const remaining = duration ? Math.max(0, duration - blockElapsed(data, now)) : null
  const illustration = exercise?.illustration
  const instructions = exercise ? getCatalogExercise(exercise.exerciseSlug)?.instructions : undefined
  const [vibrate, setVibrate] = useState(false)
  const [sound, setSound] = useState(false)
  const audio = useRef<AudioContext | null>(null)
  const lastCue = useRef('')
  const segment = `${current}:${data.currentSide ?? 0}:${Boolean(data.resting)}`

  useEffect(() => {
    if (remaining !== 0 || lastCue.current === segment) return
    lastCue.current = segment
    if (vibrate) navigator.vibrate?.([100, 50, 100])
    const context = audio.current
    if (!sound || !context || context.state !== 'running') return
    const oscillator = context.createOscillator()
    const volume = context.createGain()
    oscillator.frequency.value = 740
    volume.gain.setValueAtTime(0.12, context.currentTime)
    volume.gain.exponentialRampToValueAtTime(0.001, context.currentTime + 0.32)
    oscillator.connect(volume)
    volume.connect(context.destination)
    oscillator.start()
    oscillator.stop(context.currentTime + 0.35)
  }, [remaining, segment, sound, vibrate])

  useEffect(() => {
    if (remaining !== 0 || data.category !== 'conditioning' || data.pausedAt) return
    const timer = window.setTimeout(() => edit(workout => advanceConditioningAt(workout, Date.now())), 0)
    return () => window.clearTimeout(timer)
  }, [data.category, data.pausedAt, remaining, edit])

  useEffect(() => () => { void audio.current?.close().catch(() => undefined) }, [])

  async function toggleSound() {
    if (sound) { setSound(false); return }
    try {
      audio.current ??= new AudioContext()
      await audio.current.resume()
      setSound(true)
    } catch {
      setSound(false)
    }
  }

  function navigate(direction: Parameters<typeof advanceGuided>[1]) {
    lastCue.current = ''
    edit(workout => advanceGuided(workout, direction, Date.now()))
  }

  function updateStep(change: Partial<typeof exercise>) {
    edit(workout => ({
      ...workout,
      exercises: workout.exercises.map((step, index) => index === current ? { ...step, ...change } : step),
    }))
  }

  if (!exercise) {
    return (
      <section aria-labelledby="guided-done" className="rounded-xl border border-border bg-card p-6 text-center">
        <h2 id="guided-done" className="text-2xl font-semibold">
          {data.exercises.length ? 'Routine finished' : 'Open session'}
        </h2>
        <p className="mt-2 text-muted-foreground">
          {data.exercises.length ? 'Review the time and effort you recorded.' : 'Let the session clock run while you train, then review the activity.'}
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-2">
          {data.exercises.length > 0 && <Button type="button" variant="outline" className="min-h-11" onClick={() => navigate('back')}>Previous exercise</Button>}
          <Button type="button" className="min-h-11" onClick={review}>Review session</Button>
        </div>
      </section>
    )
  }

  return (
    <section className="space-y-4" aria-labelledby="guided-player">
      <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
        <span>Exercise {current + 1} of {data.exercises.length}</span>
        <div className="flex gap-1">
          <Button type="button" size="sm" variant="ghost" className="min-h-11" aria-pressed={sound} onClick={toggleSound}><Volume2 aria-hidden /> Sound</Button>
          <Button type="button" size="sm" variant="ghost" className="min-h-11" aria-pressed={vibrate} onClick={() => setVibrate(value => !value)} disabled={typeof navigator !== 'undefined' && !('vibrate' in navigator)}>Vibrate</Button>
        </div>
      </div>
      <progress aria-label="Exercises completed or skipped" value={current} max={Math.max(1, data.exercises.length)} className="block h-2 w-full overflow-hidden rounded-full accent-primary" />
      <div className="rounded-xl border border-border bg-card p-4 sm:p-8">
        <div className="grid items-center gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div className="min-w-0">
            <h2 id="guided-player" className="text-3xl font-semibold tracking-tight">
              {data.resting ? 'Rest' : exercise.name}
            </h2>
            {data.resting && <p className="mt-2 text-sm text-muted-foreground">Next: {data.exercises[current + 1]?.name}</p>}
            {!data.resting && exercise.sides && <p className="mt-2 text-lg font-medium text-primary">{data.currentSide ? 'Right side' : 'Left side'}</p>}
            {remaining !== null && <p className="mt-3 text-6xl font-semibold tabular-nums tracking-tight sm:text-7xl" aria-label={`${clockLabel(remaining)} remaining`}>{clockLabel(remaining)}</p>}
            {remaining === 0 && <p role="status" className="mt-1 text-sm text-primary">{data.category === 'conditioning' ? 'Interval complete.' : 'Time is up. Continue when ready.'}</p>}
            {!data.resting && exercise.repetitions !== undefined && <p className="mt-2 text-lg font-semibold">{exercise.repetitions} {exercise.repetitions === 1 ? 'rep' : 'reps'}</p>}
          </div>
          {!data.resting && illustration && <Image src={illustration} alt={`${exercise.name} illustration`} width={192} height={144} className="w-full max-w-48 justify-self-center rounded-lg bg-muted/50" />}
        </div>
        {!data.resting && (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {instructions && <ol className="ml-5 list-decimal space-y-1 text-sm text-muted-foreground">{instructions.map((item, index) => <li key={index}>{item}</li>)}</ol>}
            <div className="space-y-3">
              {(data.category === 'solo' || exercise.repetitions !== undefined || exercise.name === 'AMRAP') && <NumberField label="Repetitions completed" value={exercise.repetitionsCompleted} max={10000} change={repetitionsCompleted => updateStep({ repetitionsCompleted })} />}
              <details>
                <summary className="cursor-pointer py-2 text-sm text-muted-foreground hover:text-foreground">Log exercise notes</summary>
                <StepNotes step={exercise} change={updateStep} />
              </details>
            </div>
          </div>
        )}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Button type="button" className="min-h-12" variant="outline" onClick={() => navigate('back')} disabled={!current && !data.currentSide && !data.resting}><ChevronLeft aria-hidden /> Back</Button>
        <Button type="button" className="min-h-12" variant="outline" onClick={() => navigate('skip')}><SkipForward aria-hidden /> Skip</Button>
        <Button type="button" className="min-h-12" onClick={() => navigate('next')}>Next <ChevronRight aria-hidden /></Button>
      </div>
    </section>
  )
}
