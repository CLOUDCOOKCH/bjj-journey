'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { exerciseCatalog } from '@/lib/training/catalog'
import { trainingClient } from '@/lib/training/client'
import { activeExerciseExclusions } from '@/lib/training/performance'
import type { TrainingData } from '@/lib/training/schemas'
import {
  clockLabel, exerciseStep, fromKilograms, restRemaining, strengthNextExercise,
  type WeightUnit, type WorkoutSession, type WorkoutStep,
} from '@/lib/training/workouts'
import { fieldSelect, type ExerciseInput } from './exercise-library'
import { ProgressionSuggestion } from './progression-suggestion'
import { OrderControls, StepNotes, WorkoutSetEditor } from './workout-fields'

export function StrengthWorkout({ data, now, edit, userId, unit }: {
  data: WorkoutSession
  now: number
  edit: (change: (workout: WorkoutSession) => WorkoutSession) => void
  userId: string
  unit: WeightUnit
}) {
  const [picker, showPicker] = useState<'add' | 'replace' | null>(null)
  const [exerciseId, setExerciseId] = useState('')
  const sessionHistory = useQuery({
    queryKey: ['training', 'workouts', 'library', userId],
    queryFn: ({ signal }) => trainingClient.list<WorkoutSession>('workouts', signal),
  })
  const discomfort = useQuery({
    queryKey: ['training', 'discomfort', 'workout', userId],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'discomfort'>>('discomfort', signal),
  })
  const exclusions = activeExerciseExclusions(discomfort.data?.map(record => record.data) ?? [])
  const customExercises = useQuery({
    queryKey: ['training', 'exercises', 'library', userId],
    queryFn: ({ signal }) => trainingClient.list<ExerciseInput>('exercises', signal),
  })
  const available = [
    ...exerciseCatalog.filter(item => item.category === 'strength'),
    ...(customExercises.data ?? []).filter(record => record.data.category === 'strength').map(record => ({ ...record.data, slug: record.id })),
  ].sort((a, b) => a.name.localeCompare(b.name))

  const index = Math.min(data.currentStep ?? 0, Math.max(0, data.exercises.length - 1))
  const active = data.exercises[index]
  const completed = data.exercises.reduce((sum, exercise) => sum + (exercise.sets?.filter(set => set.completed).length ?? 0), 0)
  const total = data.exercises.reduce((sum, exercise) => sum + (exercise.sets?.length ?? 0), 0)
  const restTime = restRemaining(data, now)
  const prior = active ? sessionHistory.data?.filter(record => record.data.status === 'completed' && record.data.category === 'strength')
    .sort((a, b) => (b.data.completedAt ?? b.data.startedAt).localeCompare(a.data.completedAt ?? a.data.startedAt))
    .find(record => record.data.exercises.some(step => step.exerciseSlug === active.exerciseSlug))
    ?.data.exercises.find(step => step.exerciseSlug === active.exerciseSlug)?.sets?.filter(set => set.completed && set.kind === 'working') : undefined

  const nextWorking = active?.sets?.find(set => set.kind === 'working' && !set.completed)

  function select(i: number) { edit(workout => ({ ...workout, currentStep: i })) }

  function changeStep(step: WorkoutStep) {
    edit(workout => ({ ...workout, exercises: workout.exercises.map((item, i) => i === index ? step : item) }))
  }

  function move(direction: number) {
    edit(workout => {
      const next = [...workout.exercises]
      const [step] = next.splice(index, 1)
      next.splice(index + direction, 0, step)
      return { ...workout, exercises: next, currentStep: index + direction }
    })
  }

  function complete(indexOfSet: number) {
    edit(workout => {
      const step = workout.exercises[index]
      const set = step.sets?.[indexOfSet]
      if (!set) return workout
      const updated = {
        ...workout,
        exercises: workout.exercises.map((item, i) => i === index ? {
          ...item,
          sets: item.sets?.map((item, j) => j === indexOfSet ? { ...item, completed: !set.completed } : item),
        } : item),
      }
      if (set.completed) return updated
      const next = strengthNextExercise(updated, index)
      const rest = next.rest ? set.restSeconds ?? 0 : 0
      return {
        ...updated,
        currentStep: next.index,
        restDurationSeconds: workout.pausedAt ? rest : 0,
        restEndsAt: !workout.pausedAt && rest ? new Date(Date.now() + rest * 1000).toISOString() : undefined,
      }
    })
  }

  function apply() {
    const exercise = available.find(item => item.slug === exerciseId)
    if (!exercise || !picker) return
    edit(workout => {
      const step = exerciseStep(exercise)
      if (picker === 'add') return { ...workout, currentStep: workout.exercises.length, exercises: [...workout.exercises, step] }
      return { ...workout, exercises: workout.exercises.map((item, i) => i === index ? step : item) }
    })
    setExerciseId('')
    showPicker(null)
  }

  return (
    <section aria-labelledby="strength-log" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="strength-log" className="text-2xl font-semibold">Exercises</h2>
        <span className="text-sm text-muted-foreground">{completed} of {total} sets logged</span>
      </div>
      <progress aria-label="Sets logged" value={completed} max={Math.max(1, total)} className="block h-2 w-full overflow-hidden rounded-full accent-primary" />
      {restTime > 0 && (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-primary/30 bg-primary/10 px-4 py-2">
          <p className="font-medium">Rest <span className="ml-2 text-xl tabular-nums">{clockLabel(restTime)}</span></p>
          <Button type="button" size="sm" variant="ghost" className="min-h-11" onClick={() => edit(workout => ({ ...workout, restDurationSeconds: 0, restEndsAt: undefined }))}>End rest</Button>
        </div>
      )}
      {data.exercises.length > 0 && <nav aria-label="Workout exercises" className="flex flex-wrap gap-2">
        {data.exercises.map((item, i) => <Button type="button" key={`${item.exerciseSlug}-${i}`} size="sm" variant={i === index ? 'secondary' : 'outline'} className="min-h-11" aria-pressed={i === index} onClick={() => select(i)}>{item.name}</Button>)}
      </nav>}
      {active && <div className="space-y-4 rounded-xl border border-border bg-card p-3 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-semibold">{active.name}</h3>
            {active.setGroup && active.groupType && <p className="text-xs text-muted-foreground capitalize">{active.groupType} {active.setGroup}</p>}
          </div>
          <OrderControls label={active.name} index={index} length={data.exercises.length} onMove={move} onRemove={() => {
            if (active.sets?.some(set => set.completed) && !window.confirm('Remove this exercise and its logged sets?')) return
            edit(workout => ({
              ...workout,
              currentStep: Math.max(0, Math.min(index, workout.exercises.length - 2)),
              exercises: workout.exercises.filter((_, i) => i !== index),
            }))
          }} />
        </div>
        {prior?.length ? (
          <p className="border-b border-border pb-3 text-sm text-muted-foreground">
            <span className="font-medium text-foreground">Last session </span> {prior.map(set =>
              [set.weightKg === undefined ? null : `${Math.round(fromKilograms(set.weightKg, unit) * 100) / 100} ${unit}`,
                set.repetitions === undefined ? null : `${set.repetitions} reps`,
                set.holdSeconds === undefined ? null : `${set.holdSeconds} sec hold`].filter(Boolean).join(' · '),
            ).filter(Boolean).join(' / ')}
          </p>
        ) : sessionHistory.isSuccess && <p className="text-sm text-muted-foreground">No previous working sets for this exercise.</p>}
        {nextWorking && prior?.length && discomfort.isSuccess && !exclusions.includes(active.exerciseSlug) ? (
          <ProgressionSuggestion key={`${active.exerciseSlug}:${nextWorking.id}`} prior={prior} unit={unit} targetReps={nextWorking.repetitions || 8}
            apply={weightKg => changeStep({ ...active, sets: active.sets?.map(set => set.id === nextWorking.id ? { ...set, weightKg } : set) })} />
        ) : null}
        <WorkoutSetEditor step={active} onChange={changeStep} onComplete={complete} unit={unit} live />
        <details>
          <summary className="cursor-pointer py-2 text-sm text-muted-foreground">Exercise notes</summary>
          <StepNotes step={active} change={changeStep} />
        </details>
      </div>}
      {!active && <p className="rounded-xl border border-dashed border-border p-4 text-sm text-muted-foreground">Add an exercise to record sets.</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="button" variant="outline" className="min-h-11" onClick={() => showPicker('add')} disabled={data.exercises.length >= 100}>Add exercise</Button>
        {active && <Button type="button" variant="outline" className="min-h-11" onClick={() => {
          if (active.sets?.some(set => set.completed) && !window.confirm('Replace this exercise and its logged sets?')) return
          showPicker('replace')
        }}>Replace exercise</Button>}
      </div>
      {picker && <div className="space-y-3 rounded-xl border border-border bg-card p-4">
        <Label className="grid gap-2">{picker === 'add' ? 'Add exercise' : 'Replace exercise'}
          <select className={fieldSelect} value={exerciseId} onChange={event => setExerciseId(event.target.value)}>
            <option value="">Choose an exercise</option>
            {available.map(item => <option value={item.slug} key={item.slug}>{item.name}</option>)}
          </select>
        </Label>
        <div className="flex gap-2">
          <Button type="button" className="min-h-11" disabled={!exerciseId} onClick={apply}>{picker === 'add' ? 'Add to workout' : 'Replace'}</Button>
          <Button type="button" variant="outline" className="min-h-11" onClick={() => { setExerciseId(''); showPicker(null) }}>Cancel</Button>
        </div>
      </div>}
    </section>
  )
}
