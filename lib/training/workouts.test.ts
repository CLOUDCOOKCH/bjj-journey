import { clockLabel, elapsedSeconds, fromKilograms, intervalSteps, toKilograms } from './workouts'

describe('workout timing and weights', () => {
  it('converts pounds to kilograms for storage and round trips display values', () => {
    expect(toKilograms(100, 'lb')).toBeCloseTo(45.359237)
    expect(fromKilograms(toKilograms(100, 'lb'), 'lb')).toBeCloseTo(100)
    expect(toKilograms(100, 'kg')).toBe(100)
  })

  it('uses timestamps to recover elapsed time after backgrounding and keeps pauses static', () => {
    const now = Date.parse('2026-01-01T10:02:30Z')
    expect(elapsedSeconds(10, '2026-01-01T10:00:00Z', now)).toBe(160)
    expect(elapsedSeconds(10, undefined, now)).toBe(10)
    expect(clockLabel(160)).toBe('02:40')
  })

  it('places interval rest only between rounds and adds configurable warm-up and cooldown', () => {
    const steps = intervalSteps('sparring', 2, 300, 60, 120, 90)
    expect(steps.map(step => [step.durationSeconds, step.restSeconds])).toEqual([
      [120, undefined], [300, 60], [300, undefined], [90, undefined],
    ])
  })

  it('makes AMRAP a single work block', () => {
    expect(intervalSteps('amrap', 8, 600, 10, 0, 0)).toEqual([
      { exerciseSlug: 'interval-work', name: 'AMRAP', durationSeconds: 600, restSeconds: undefined },
    ])
  })
})

import { advanceConditioningAt, advanceGuided, blockElapsed, pauseWorkout, resumeWorkout, type WorkoutSession } from './workouts'

const start = Date.parse('2026-01-01T10:00:00Z')
const stamp = new Date(start).toISOString()

function activeWorkout(overrides: Partial<WorkoutSession> = {}): WorkoutSession {
  return {
    title: 'Guard mobility', category: 'mobility', status: 'in_progress', startedAt: stamp,
    runningSince: stamp, stepRunningSince: stamp, elapsedSeconds: 0, currentStep: 0, currentSide: 0,
    exercises: [
      { exerciseSlug: 'stretch', name: 'Stretch', sides: true, durationSeconds: 20, restSeconds: 10 },
      { exerciseSlug: 'raise', name: 'Raise', repetitions: 10 },
    ],
    ...overrides,
  }
}

describe('guided workout transitions', () => {
  it('runs both sides and one rest before advancing', () => {
    const left = activeWorkout()
    const right = advanceGuided(left, 'next', start + 20000)
    expect(right).toMatchObject({ currentStep: 0, currentSide: 1, resting: false })
    const rest = advanceGuided(right, 'next', start + 40000)
    expect(rest).toMatchObject({ currentStep: 0, currentSide: 0, resting: true })
    expect(advanceGuided(rest, 'next', start + 50000)).toMatchObject({ currentStep: 1, resting: false })
  })

  it('persists pauses and records skipped exercises', () => {
    const paused = pauseWorkout(activeWorkout(), start + 10000)
    expect(blockElapsed(paused, start + 90000)).toBe(10)
    const resumed = resumeWorkout(paused, start + 90000)
    expect(blockElapsed(resumed, start + 95000)).toBe(15)
    expect(advanceGuided(resumed, 'skip', start + 95000)).toMatchObject({ currentStep: 1, skipped: [0] })
  })

  it('catches up on exact conditioning boundaries after a suspended tab', () => {
    const timed = activeWorkout({
      category: 'conditioning',
      exercises: intervalSteps('custom', 2, 30, 5, 10, 15),
    })
    const duringRest = advanceConditioningAt(timed, start + 41000)
    expect(duringRest).toMatchObject({ currentStep: 1, resting: true })
    expect(blockElapsed(duringRest, start + 41000)).toBe(1)
    const completed = advanceConditioningAt(timed, start + 180000)
    expect(completed.currentStep).toBe(4)
    expect(completed.elapsedSeconds).toBe(90)
    expect(completed.pausedAt).toBe(new Date(start + 90000).toISOString())
  })
})
