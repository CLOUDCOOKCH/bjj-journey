import type { WorkoutSet } from './workouts'

export interface ProgressionTarget {
  minReps: number
  maxReps: number
  maxRpe: number
}

export function suggestProgression(sets: WorkoutSet[], target: ProgressionTarget) {
  const { minReps, maxReps, maxRpe } = target
  if (!Number.isInteger(minReps) || !Number.isInteger(maxReps) || minReps < 1 || maxReps < minReps ||
      !Number.isFinite(maxRpe) || maxRpe < 1 || maxRpe > 10) return null
  const working = sets.filter(set => set.kind === 'working' && set.completed)
  if (!working.length) return null
  const weight = working[0].weightKg
  if (!weight || working.some(set => set.weightKg !== weight || set.holdSeconds)) return null
  const reps = working.map(set => set.repetitions)
  const efforts = working.map(set => set.rpe)
  if (reps.some(value => value === undefined || value < maxReps) ||
      efforts.some(value => value === undefined || value > maxRpe)) return null
  const added = Math.min(2.5, Math.floor(weight * 2.5) / 100)
  if (added < 0.01 || weight + added > 1500) return null
  return {
    weightKg: Number((weight + added).toFixed(6)),
    priorWeightKg: weight,
    workingSets: working.length,
    lowReps: Math.min(...reps.map(value => value ?? 0)),
    peakRpe: Math.max(...efforts.map(value => value ?? 0)),
  }
}
