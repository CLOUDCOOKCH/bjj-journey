import {
  activeExerciseExclusions, addTrainingDays, benchmarkResultSchema, defaultReadinessRules, discomfortSchema,
  fitnessMilestones, getLocalTrainingDate, goalSchema, recommendReadiness, recoverySchema,
  startOfTrainingWeek, strengthRecords, trainingLoad, weeklyGoalProgress,
  type Benchmark, type DiscomfortEntry, type TrainingSample,
} from './performance'

const date = '2026-11-23'
const enabledRules = { ...defaultReadinessRules, enabled: true }
const benchmarkId = '3b18ec88-7619-48e1-8cdf-4428e45837b0'

describe('recovery and discomfort', () => {
  test('keeps suggestions opt-in and reports missing inputs explicitly', () => {
    expect(recommendReadiness(undefined, defaultReadinessRules).label).toBe('Readiness is off')
    expect(recommendReadiness({ date, sleepHours: 8 }, enabledRules).label).toBe('Insufficient data')
    expect(recommendReadiness({ date, sleepHours: 8, soreness: 2, fatigue: 3 }, enabledRules).label).toBe('Normal training')
  })

  test('uses configured boundaries and explains which thresholds changed the recommendation', () => {
    const sleepOnly = recommendReadiness({ date, sleepHours: 6, soreness: 3, fatigue: 3 }, enabledRules)
    expect(sleepOnly).toEqual({ label: 'Reduced intensity', reasons: ['Sleep was below your 7-hour target.'] })
    const soreness = recommendReadiness({ date, sleepHours: 7, soreness: 3, fatigue: 3 }, { ...enabledRules, maxSoreness: 2 })
    expect(soreness).toEqual({ label: 'Gentle mobility', reasons: ['Soreness exceeded your threshold of 2 out of 5.'] })
    expect(recommendReadiness({ date, sleepHours: 6, soreness: 4, fatigue: 3 }, enabledRules).label).toBe('Active recovery')
    expect(recommendReadiness({ date, sleepHours: 6, soreness: 4, fatigue: 4 }, enabledRules).label).toBe('Rest day')
    expect(recommendReadiness({ date, sleepHours: 8, soreness: 2, fatigue: 2, discomfort: 5 }, enabledRules).reasons.join(' ')).toContain('professional assessment')
  })

  test('validates dates and measurement limits and rejects fields the client cannot write', () => {
    expect(recoverySchema.safeParse({ date, sleepHours: 0, heartRateVariability: 0 }).success).toBe(true)
    expect(recoverySchema.safeParse({ date: '2026-02-29', energy: 1 }).success).toBe(false)
    expect(recoverySchema.safeParse({ date, restingHeartRate: 260 }).success).toBe(false)
    expect(recoverySchema.safeParse({ date, energy: 2.5 }).success).toBe(false)
    expect(recoverySchema.safeParse({ date, ownerId: 'other' }).success).toBe(false)
  })

  test('excludes each exercise once and only while an entry is ongoing', () => {
    const common = { onsetDate: date, bodyRegion: 'Knees', severity: 2, side: 'left' } as const
    const entries: DiscomfortEntry[] = [
      { ...common, status: 'ongoing', excludedExerciseSlugs: ['squat', 'lunge'] },
      { ...common, status: 'ongoing', excludedExerciseSlugs: ['lunge'] },
      { ...common, status: 'resolved', excludedExerciseSlugs: ['run'] },
    ]
    expect(activeExerciseExclusions(entries)).toEqual(['squat', 'lunge'])
    expect(discomfortSchema.safeParse({ ...entries[0], side: 'up' }).success).toBe(false)
  })
})

describe('training dates and load', () => {
  test('uses the athlete time zone at midnight and keeps date-only math through a DST transition', () => {
    const instant = new Date('2026-11-23T00:30:00Z')
    expect(getLocalTrainingDate(instant, 'Europe/Berlin')).toBe('2026-11-23')
    expect(getLocalTrainingDate(instant, 'America/New_York')).toBe('2026-11-22')
    expect(startOfTrainingWeek('2026-11-22')).toBe('2026-11-16')
    expect(addTrainingDays('2026-03-28', 2)).toBe('2026-03-30')
  })

  test('calculates explicit RPE loads while preserving zero as a recorded measurement', () => {
    const entries: TrainingSample[] = [
      { date, category: 'bjj', durationMinutes: 60, sessionRpe: 8 },
      { date, category: 'strength', durationMinutes: 20, sessionRpe: 7 },
      { date, category: 'mobility', durationMinutes: 12 },
      { date: '2026-11-24', category: 'recovery', durationMinutes: 30, sessionRpe: 0 },
      { date: '2026-11-20', category: 'solo', durationMinutes: 10, sessionRpe: 5 },
    ]
    const result = trainingLoad(entries, date, '2026-11-24')
    expect(result).toMatchObject({ load: 620, sessions: 4, measuredSessions: 3, averageRpe: 5, highIntensityDays: 1, activeDays: 1, recoveryDays: 1 })
    expect(result.byCategory).toEqual({ bjj: 60, strength: 20, mobility: 12, recovery: 30 })
    expect(result.daily.get(date)).toBe(620)
    expect(result.daily.get('2026-11-24')).toBe(0)
  })

  test('ignores missing duration in load while keeping a valid reported RPE in the intensity average', () => {
    expect(trainingLoad([{ date, category: 'bjj', sessionRpe: 8 }, { date, category: 'strength', durationMinutes: 30, sessionRpe: 11 }], date, date)).toMatchObject({
      load: 0, measuredSessions: 0, averageRpe: 8, sessions: 2, highIntensityDays: 1,
    })
  })
})

describe('goals, records and milestones', () => {
  test('weekly goals count completed work within the active week and one check-in per day', () => {
    const samples: TrainingSample[] = [{ date, category: 'mobility', durationMinutes: 15 }, { date: '2026-11-22', category: 'mobility', durationMinutes: 100 }]
    expect(weeklyGoalProgress({ metric: 'mobility_minutes', target: 15 }, samples, [], date, date)).toEqual({ value: 15, reached: true })
    expect(weeklyGoalProgress({ metric: 'recovery_check_ins', target: 2 }, [], [{ date }, { date }], date, date)).toEqual({ value: 1, reached: false })
    expect(goalSchema.safeParse({ metric: 'bjj_sessions', target: 2.5 }).success).toBe(false)
    expect(goalSchema.safeParse({ metric: 'benchmark', target: 2 }).success).toBe(false)
  })

  test('benchmark goals respect measurement direction and isolate matching benchmark results', () => {
    const benchmark: Benchmark = { title: 'Two kilometre row', unit: 'minutes', category: 'conditioning', lowerIsBetter: true }
    const goal = { metric: 'benchmark', target: 8, benchmarkId } as const
    const data = [{ benchmarkId, date, value: 9 }, { benchmarkId, date, value: 7.8 }, { benchmarkId: 'other', date, value: 2 }]
    expect(weeklyGoalProgress(goal, [], [], date, date, benchmark, data)).toEqual({ value: 7.8, reached: true })
    expect(weeklyGoalProgress(goal, [], [], date, date, benchmark)).toEqual({ value: null, reached: false })
    expect(benchmarkResultSchema.safeParse({ benchmarkId, date, value: -1 }).success).toBe(false)
  })

  test('records and volume only use completed working sets', () => {
    const results = strengthRecords([{ date, exercises: [
      { exerciseSlug: 'deadlift', name: 'Deadlift', sets: [
        { completed: true, kind: 'warmup', repetitions: 5, weightKg: 100 },
        { completed: false, kind: 'working', repetitions: 3, weightKg: 140 },
        { completed: true, kind: 'working', repetitions: 5, weightKg: 90 },
        { completed: true, kind: 'working', repetitions: 1, weightKg: 100 },
      ] },
      { exerciseSlug: 'dead-hang', name: 'Dead hang', sets: [{ completed: true, kind: 'working', holdSeconds: 45 }] },
    ] }])
    const [hold, lift] = results
    expect(hold).toMatchObject({ slug: 'dead-hang', longestHoldSeconds: 45, estimatedOneRepMaxKg: null })
    expect(lift).toMatchObject({ slug: 'deadlift', heaviestKg: 100, volumeKg: 550 })
    expect(lift.estimatedOneRepMaxKg).toBeCloseTo(105)
    expect(lift.sets).toHaveLength(2)
  })

  test('first milestones are deterministic and rest days cannot break a completed training week', () => {
    const samples: TrainingSample[] = [
      { date: '2026-10-26', category: 'bjj' },
      { date: '2026-10-29', category: 'mobility', durationMinutes: 30 },
      { date: '2026-11-02', category: 'strength' },
      { date: '2026-11-09', category: 'solo' },
      { date: '2026-11-16', category: 'mobility', durationMinutes: 90 },
      { date: '2026-11-17', category: 'strength' },
    ]
    const milestones = fitnessMilestones(samples, '2026-11-02', date)
    expect(milestones.find(({ id }) => id === 'balanced-week')?.earnedDate).toBe('2026-11-01')
    expect(milestones.find(({ id }) => id === 'consistent-weeks')?.earnedDate).toBe('2026-11-22')
    expect(milestones.find(({ id }) => id === 'first-strength')?.earnedDate).toBe('2026-11-02')
    expect(milestones.find(({ id }) => id === 'mobility-minutes')?.earnedDate).toBe('2026-11-16')
    expect(milestones.find(({ id }) => id === 'mobility-routines')?.earnedDate).toBeUndefined()
  })
})
