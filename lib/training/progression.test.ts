import { suggestProgression } from './progression'
import type { WorkoutSet } from './workouts'

const set: WorkoutSet = { id: '1', kind: 'working', completed: true, repetitions: 8, weightKg: 60, rpe: 7 }
const target = { minReps: 6, maxReps: 8, maxRpe: 7 }

it('suggests a small increase only after comparable sets at the top of the target range', () => {
  expect(suggestProgression([set, { ...set, id: '2' }], target)).toMatchObject({
    weightKg: 61.5, priorWeightKg: 60, workingSets: 2, lowReps: 8, peakRpe: 7,
  })
  expect(suggestProgression([{ ...set, weightKg: 120 }], target)?.weightKg).toBe(122.5)
})

it('omits a suggestion for insufficient reps, excessive or missing exertion, holds, and mismatched loads', () => {
  expect(suggestProgression([{ ...set, repetitions: 7 }], target)).toBeNull()
  expect(suggestProgression([{ ...set, rpe: 7.5 }], target)).toBeNull()
  expect(suggestProgression([{ ...set, rpe: undefined }], target)).toBeNull()
  expect(suggestProgression([{ ...set, holdSeconds: 20 }], target)).toBeNull()
  expect(suggestProgression([set, { ...set, id: '2', weightKg: 50 }], target)).toBeNull()
  expect(suggestProgression([set], { ...target, minReps: 9 })).toBeNull()
})
