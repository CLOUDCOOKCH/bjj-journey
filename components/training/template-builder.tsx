'use client'

import Link from 'next/link'
import { useState } from 'react'
import { CalendarPlus, Play, Save, Timer } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { intervalSteps, type IntervalFormat, type WeightUnit, type WorkoutTemplate } from '@/lib/training/workouts'
import { fieldSelect } from './exercise-library'
import { NumberField, OrderControls, StepNotes, WorkoutSetEditor } from './workout-fields'

export function TemplateBuilder({ template, onChange, onSave, onStart, scheduleHref, selectedTemplate, plannedActivity, busy, unit }: {
  template: WorkoutTemplate
  onChange: (template: WorkoutTemplate) => void
  onSave: (copy?: boolean) => void
  onStart: () => void
  scheduleHref?: string
  selectedTemplate: boolean
  plannedActivity: boolean
  busy: boolean
  unit: WeightUnit
}) {
  function move(index: number, change: number) {
    const steps = [...template.steps]
    const [step] = steps.splice(index, 1)
    steps.splice(index + change, 0, step)
    onChange({ ...template, steps })
  }

  function saveOrStart(action: () => void) {
    return (event: React.MouseEvent<HTMLButtonElement>) => {
      if (event.currentTarget.form?.reportValidity()) action()
    }
  }

  return (
    <section id="workout-builder" aria-labelledby="workout-builder-title" className="space-y-4">
      <h2 id="workout-builder-title" className="text-2xl font-semibold tracking-tight">Workout builder</h2>
      <form className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6" onSubmit={event => { event.preventDefault(); onStart() }}>
        {plannedActivity && <p className="text-sm text-primary">This workout will complete a scheduled activity.</p>}
        <Label className="grid gap-2">Workout name<Input value={template.title} maxLength={200} className="min-h-11" required onChange={event => onChange({ ...template, title: event.target.value })} /></Label>
        <div className="flex flex-wrap gap-2 pt-2">
          <Button type="submit" className="min-h-11" disabled={busy}><Play aria-hidden /> Start workout</Button>
          <Button type="button" className="min-h-11" variant="outline" disabled={busy} onClick={saveOrStart(() => onSave())}><Save aria-hidden /> Save routine</Button>
          {selectedTemplate && <Button type="button" className="min-h-11" variant="outline" disabled={busy} onClick={saveOrStart(() => onSave(true))}>Duplicate</Button>}
          {scheduleHref && <Button asChild className="min-h-11" variant="outline"><Link href={scheduleHref}><CalendarPlus aria-hidden /> Schedule</Link></Button>}
        </div>
        <Label className="grid gap-2">Workout notes<Textarea value={template.description} maxLength={4000} onChange={event => onChange({ ...template, description: event.target.value })} /></Label>
        {!template.steps.length && (
          <p className="rounded-lg border border-dashed border-border p-4 text-sm text-muted-foreground">
            {template.category === 'conditioning' ? 'Add an exercise, build intervals, or start an open cardio session.' : 'Select a routine or use the exercise library to add movements.'}
          </p>
        )}
        {!!template.steps.length && <div className="divide-y divide-border">
          {template.steps.map((step, index) => {
            function change(next: typeof step) {
              onChange({ ...template, steps: template.steps.map((item, i) => i === index ? next : item) })
            }
            return (
              <div key={`${step.exerciseSlug}-${index}`} className="space-y-2 py-2">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-sm font-semibold">{step.name}</h3>
                  <OrderControls label={step.name} index={index} length={template.steps.length} onMove={direction => move(index, direction)} onRemove={() => onChange({ ...template, steps: template.steps.filter((_, i) => i !== index) })} />
                </div>
                <details open={template.steps.length === 1}>
                  <summary className="cursor-pointer py-2 text-sm text-muted-foreground hover:text-foreground">
                    {template.category === 'strength'
                      ? `${step.sets?.length ?? 0} ${step.sets?.length === 1 ? 'set' : 'sets'}`
                      : [step.durationSeconds ? `${step.durationSeconds} sec` : '', step.repetitions ? `${step.repetitions} reps` : '', step.sides ? 'each side' : '', step.restSeconds ? `${step.restSeconds} sec rest` : ''].filter(Boolean).join(' · ') || 'Exercise details'}
                  </summary>
                  <div className="space-y-3 pt-2">
                    {template.category === 'strength' ? (
                      <>
                        <div className="grid gap-3 sm:grid-cols-2">
                          <Label className="grid gap-2 text-xs">Exercise grouping
                            <select className={fieldSelect} value={step.groupType ?? ''} onChange={event => change({ ...step, groupType: (event.target.value || undefined) as typeof step.groupType, setGroup: event.target.value ? step.setGroup : undefined })}>
                              <option value="">Individual exercise</option><option value="superset">Superset</option><option value="circuit">Circuit</option>
                            </select>
                          </Label>
                          {step.groupType && <Label className="grid gap-2 text-xs">Group name<Input className="min-h-11" maxLength={60} value={step.setGroup ?? ''} placeholder="A" onChange={event => change({ ...step, setGroup: event.target.value })} /></Label>}
                        </div>
                        <WorkoutSetEditor step={step} unit={unit} onChange={change} />
                      </>
                    ) : (
                      <div className="grid grid-cols-2 gap-3">
                        <NumberField label="Duration (sec)" max={14400} value={step.durationSeconds} change={durationSeconds => change({ ...step, durationSeconds })} />
                        <NumberField label="Repetitions" max={10000} value={step.repetitions} change={repetitions => change({ ...step, repetitions })} />
                        <NumberField label="Rest (sec)" max={3600} value={step.restSeconds} change={restSeconds => change({ ...step, restSeconds })} />
                        <label className="flex min-h-11 items-center gap-2 text-sm"><input type="checkbox" className="size-4 accent-primary" checked={step.sides ?? false} onChange={event => change({ ...step, sides: event.target.checked })} /> Both sides</label>
                      </div>
                    )}
                    <StepNotes step={step} change={change} />
                  </div>
                </details>
              </div>
            )
          })}
        </div>}
      </form>
    </section>
  )
}

const intervalDefaults: Record<IntervalFormat, [number, number, number]> = {
  emom: [10, 60, 0], amrap: [1, 600, 0], tabata: [8, 20, 10], sparring: [5, 300, 60], custom: [4, 60, 60],
}

const intervalLabels: Record<IntervalFormat, string> = {
  emom: 'EMOM', amrap: 'AMRAP', tabata: 'Tabata', sparring: 'BJJ sparring rounds', custom: 'Custom intervals',
}

const intervalDescriptions: Record<IntervalFormat, string> = {
  emom: 'Start the prescribed effort at the start of each minute and use its remainder to recover.',
  amrap: 'Complete controlled rounds within one continuous time block. Count rounds or repetitions as you go.',
  tabata: 'Use short work and rest blocks. Ease off the intensity or reduce rounds as needed.',
  sparring: 'Rehearse the work and recovery pattern of rounds on the mat.',
  custom: 'Build work and rest blocks for your equipment and conditioning goal.',
}

export function IntervalBuilder({ apply }: { apply: (title: string, steps: ReturnType<typeof intervalSteps>) => void }) {
  const [format, setFormat] = useState<IntervalFormat>('sparring')
  const [rounds, setRounds] = useState<number | undefined>(5)
  const [work, setWork] = useState<number | undefined>(300)
  const [rest, setRest] = useState<number | undefined>(60)
  const [warmup, setWarmup] = useState<number | undefined>(0)
  const [cooldown, setCooldown] = useState<number | undefined>(0)
  return (
    <details className="rounded-xl border border-border bg-card p-4">
      <summary className="cursor-pointer font-semibold">Build an interval timer</summary>
      <form className="mt-4 space-y-4" onSubmit={event => {
        event.preventDefault()
        apply(intervalLabels[format], intervalSteps(format, rounds || 1, work || 1, rest || 0, warmup || 0, cooldown || 0))
      }}>
        <Label className="grid gap-2">Format<select className={fieldSelect} value={format} onChange={event => {
          const next = event.target.value as IntervalFormat
          const [initialRounds, initialWork, initialRest] = intervalDefaults[next]
          setFormat(next)
          setRounds(initialRounds)
          setWork(initialWork)
          setRest(initialRest)
        }}>{Object.entries(intervalLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}</select></Label>
        <p className="text-sm text-muted-foreground">{intervalDescriptions[format]}</p>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {format !== 'amrap' && <NumberField label="Rounds" value={rounds} min={1} max={60} change={setRounds} />}
          {format !== 'emom' && <NumberField label="Work (sec)" value={work} min={1} max={14400} change={setWork} />}
          {format !== 'emom' && format !== 'amrap' && <NumberField label="Rest (sec)" value={rest} max={3600} change={setRest} />}
          <NumberField label="Warm-up (sec)" value={warmup} max={3600} change={setWarmup} />
          <NumberField label="Cooldown (sec)" value={cooldown} max={3600} change={setCooldown} />
        </div>
        <Button type="submit" variant="outline" className="min-h-11"><Timer aria-hidden /> Add intervals to workout</Button>
      </form>
    </details>
  )
}
