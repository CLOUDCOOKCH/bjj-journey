'use client'

import { ArrowDown, ArrowUp, Check, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { fromKilograms, newWorkoutSet, toKilograms, type WeightUnit, type WorkoutSet, type WorkoutStep } from '@/lib/training/workouts'
import { fieldSelect } from './exercise-library'

export function NumberField({ label, value, change, min = 0, max, step = 1, placeholder }: {
  label: string
  value?: number
  change: (value?: number) => void
  min?: number
  max?: number
  step?: number
  placeholder?: string
}) {
  return (
    <Label className="grid gap-2 text-xs">
      {label}
      <Input inputMode={step === 1 ? 'numeric' : 'decimal'} type="number" className="min-h-11 min-w-0" min={min} max={max} step={step}
        value={value ?? ''} placeholder={placeholder} onChange={event => {
          const parsed = event.target.valueAsNumber
          change(Number.isFinite(parsed) ? parsed : undefined)
        }}
      />
    </Label>
  )
}

export function OrderControls({ label, index, length, onMove, onRemove }: {
  label: string
  index: number
  length: number
  onMove: (change: number) => void
  onRemove: () => void
}) {
  return (
    <div className="flex flex-none gap-0.5">
      <Button type="button" variant="ghost" className="size-11" size="icon" onClick={() => onMove(-1)} disabled={index === 0} aria-label={`Move ${label} up`}><ArrowUp aria-hidden /></Button>
      <Button type="button" variant="ghost" className="size-11" size="icon" onClick={() => onMove(1)} disabled={index === length - 1} aria-label={`Move ${label} down`}><ArrowDown aria-hidden /></Button>
      <Button type="button" variant="ghost" className="size-11 text-muted-foreground hover:text-destructive" size="icon" onClick={onRemove} aria-label={`Remove ${label}`}><Trash2 aria-hidden /></Button>
    </div>
  )
}

export function WorkoutSetEditor({ step, unit, onChange, live = false, onComplete }: {
  step: WorkoutStep
  unit: WeightUnit
  onChange: (step: WorkoutStep) => void
  live?: boolean
  onComplete?: (index: number) => void
}) {
  const sets = step.sets ?? []
  function update(index: number, patch: Partial<WorkoutSet>) {
    onChange({ ...step, sets: sets.map((set, i) => i === index ? { ...set, ...patch } : set) })
  }
  function append() {
    const recent = sets.at(-1) ?? { repetitions: 8, restSeconds: 90 }
    onChange({ ...step, sets: [...sets, newWorkoutSet(recent)] })
  }

  return (
    <div className="space-y-3">
      {sets.map((set, index) => {
        const weight = set.weightKg === undefined ? undefined : Math.round(fromKilograms(set.weightKg, unit) * 100) / 100
        return (
          <fieldset key={set.id} className="rounded-lg border border-border px-3 pb-3">
            <legend className="px-2 text-sm font-medium">Set {index + 1}{set.completed ? ' · Done' : ''}</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              <NumberField label={`Weight (${unit})`} value={weight} max={unit === 'kg' ? 1500 : 3306} step={0.01} change={value => update(index, { weightKg: value === undefined ? undefined : toKilograms(value, unit) })} />
              <NumberField label="Repetitions" value={set.repetitions} max={1000} change={repetitions => update(index, { repetitions })} />
              <NumberField label="Hold (sec)" value={set.holdSeconds} max={10800} change={holdSeconds => update(index, { holdSeconds })} />
              <NumberField label="Rest (sec)" value={set.restSeconds} max={3600} change={restSeconds => update(index, { restSeconds })} />
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer py-2 text-sm text-muted-foreground hover:text-foreground">Set details</summary>
              <div className="mt-2 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                <Label className="grid gap-2 text-xs">Set type<select className={fieldSelect} value={set.kind} onChange={event => update(index, { kind: event.target.value as WorkoutSet['kind'] })}><option value="working">Working set</option><option value="warmup">Warm-up set</option></select></Label>
                <NumberField label="RPE (0–10)" value={set.rpe} max={10} step={0.5} change={rpe => update(index, { rpe })} />
                <NumberField label="Reps in reserve" value={set.rir} max={20} change={rir => update(index, { rir })} />
                <Label className="grid gap-2 text-xs">Tempo<Input maxLength={40} className="min-h-11" value={set.tempo ?? ''} onChange={event => update(index, { tempo: event.target.value })} placeholder="3-0-1-0" /></Label>
              </div>
            </details>
            <div className="mt-2 flex flex-wrap justify-end gap-2">
              {live && <Button type="button" size="sm" className="min-h-11 flex-1 sm:flex-none" aria-pressed={set.completed} variant={set.completed ? 'secondary' : 'default'} onClick={() => onComplete?.(index)}><Check aria-hidden /> {set.completed ? 'Undo set' : 'Complete set'}</Button>}
              <Button type="button" variant="ghost" size="sm" aria-label={`Remove set ${index + 1}`} className="min-h-11" onClick={() => onChange({ ...step, sets: sets.filter((_, i) => i !== index) })}><Trash2 aria-hidden /> Remove</Button>
            </div>
          </fieldset>
        )
      })}
      <Button type="button" variant="outline" size="sm" className="min-h-11" onClick={append} disabled={sets.length >= 60}><Plus aria-hidden /> Add set</Button>
    </div>
  )
}

export function StepNotes({ step, change }: { step: WorkoutStep; change: (step: WorkoutStep) => void }) {
  return (
    <Label className="grid gap-2 text-sm">
      Exercise notes
      <Textarea value={step.notes ?? ''} maxLength={4000} onChange={event => change({ ...step, notes: event.target.value })} />
    </Label>
  )
}
