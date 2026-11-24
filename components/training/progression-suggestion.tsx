'use client'

import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { suggestProgression } from '@/lib/training/progression'
import { fromKilograms, toKilograms, type WeightUnit, type WorkoutSet } from '@/lib/training/workouts'

export function ProgressionSuggestion({ prior, unit, targetReps, apply }: {
  prior: WorkoutSet[]
  unit: WeightUnit
  targetReps: number
  apply: (kilograms: number) => void
}) {
  const [proposal, setProposal] = useState<ReturnType<typeof suggestProgression>>()
  const [value, setValue] = useState('')
  const [dismissed, setDismissed] = useState(false)
  const format = (weight: number) => String(Math.round(fromKilograms(weight, unit) * 100) / 100)

  function preview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = new FormData(event.currentTarget)
    const suggestion = suggestProgression(prior, {
      minReps: Number(form.get('min')), maxReps: Number(form.get('max')), maxRpe: Number(form.get('effort')),
    })
    setProposal(suggestion)
    setValue(suggestion ? format(suggestion.weightKg) : '')
  }

  if (dismissed) return null
  return (
    <details className="rounded-lg border px-3 py-2">
      <summary className="min-h-9 cursor-pointer py-1 text-sm font-medium">Check for a weight progression</summary>
      <form className="flex flex-wrap items-end gap-2 py-2" onSubmit={preview}>
        <label className="w-24 text-xs font-medium">Minimum reps
          <Input name="min" type="number" min={1} max={1000} defaultValue={Math.max(1, targetReps - 2)} required />
        </label>
        <label className="w-24 text-xs font-medium">Target reps
          <Input name="max" type="number" min={1} max={1000} defaultValue={targetReps} required />
        </label>
        <label className="w-24 text-xs font-medium">RPE limit
          <Input name="effort" type="number" min={1} max={10} step={0.5} defaultValue={7} required />
        </label>
        <Button type="submit" variant="outline">Check</Button>
      </form>
      {proposal === null && <p role="status" className="pb-2 text-sm text-muted-foreground">No increase suggested. Check that your last working sets used a consistent load and reached your rep target within your RPE limit.</p>}
      {proposal && (
        <div className="space-y-2 pb-2">
          <p className="text-sm text-muted-foreground">You logged {proposal.workingSets} working sets at {format(proposal.priorWeightKg)} {unit}, with at least {proposal.lowReps} reps and a highest RPE of {proposal.peakRpe}. Suggested next weight is {format(proposal.weightKg)} {unit}.</p>
          <div className="flex flex-wrap items-end gap-2">
            <label className="w-28 text-xs font-medium">Weight ({unit})
              <Input type="number" min={0} max={unit === 'kg' ? 1500 : 3306} step={0.01} value={value} onChange={event => setValue(event.target.value)} />
            </label>
            <Button type="button" disabled={!value || !Number.isFinite(Number(value)) || Number(value) < 0 || toKilograms(Number(value), unit) > 1500} onClick={() => {
              apply(toKilograms(Number(value), unit))
              setDismissed(true)
            }}>Apply to next set</Button>
            <Button type="button" variant="ghost" onClick={() => setDismissed(true)}>Dismiss</Button>
          </div>
        </div>
      )}
    </details>
  )
}
