import { z } from 'zod'
import { addCalendarDays, dateInZone, firstDayOfWeek } from './planner'

export { addCalendarDays as addTrainingDays, dateInZone as getLocalTrainingDate, firstDayOfWeek as startOfTrainingWeek }

const calendarDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine((date) => {
  const parsed = new Date(`${date}T00:00:00Z`)
  return !date.startsWith('0000') && Number.isFinite(parsed.getTime()) && parsed.toISOString().slice(0, 10) === date
}, 'Enter a valid calendar date')

const rating = z.number().int().min(1).max(5)
const name = z.string().trim().min(1).max(100)
const optionalNotes = z.string().trim().max(1000).optional()

export const recoverySchema = z.object({
  date: calendarDate,
  sleepHours: z.number().min(0).max(24).optional(),
  sleepQuality: rating.optional(),
  energy: rating.optional(),
  soreness: rating.optional(),
  stress: rating.optional(),
  motivation: rating.optional(),
  fatigue: rating.optional(),
  discomfort: rating.optional(),
  restingHeartRate: z.number().int().min(1).max(250).optional(),
  heartRateVariability: z.number().min(0).max(500).optional(),
}).strict().refine(
  (entry) => Object.entries(entry).some(([field, value]) => field !== 'date' && value !== undefined),
  'Enter at least one measure before saving',
)

export const readinessRulesSchema = z.object({
  enabled: z.boolean(),
  minimumSleepHours: z.number().min(1).max(16),
  maxSoreness: rating,
  maxFatigue: rating,
}).strict()

export const discomfortRegions = [
  'Neck', 'Shoulders', 'Upper back', 'Lower back', 'Elbows', 'Wrists and hands',
  'Hips and groin', 'Thighs', 'Knees', 'Calves', 'Ankles and feet',
] as const

export const discomfortSchema = z.object({
  onsetDate: calendarDate,
  bodyRegion: z.enum(discomfortRegions),
  side: z.enum(['left', 'right', 'both', 'central']),
  severity: rating,
  status: z.enum(['ongoing', 'resolved']),
  notes: optionalNotes,
  associatedActivities: z.string().trim().max(200).optional(),
  course: z.enum(['new', 'improving', 'persistent', 'worsening']).optional(),
  excludedExerciseSlugs: z.array(z.string().trim().min(1).max(120)).max(30),
}).strict()

export const benchmarkUnits = ['reps', 'seconds', 'kilograms', 'metres', 'minutes', 'custom'] as const
export const benchmarkCategories = ['strength', 'conditioning', 'mobility', 'custom'] as const

export const benchmarkSchema = z.object({
  title: name,
  unit: z.enum(benchmarkUnits),
  customUnit: z.string().trim().min(1).max(32).optional(),
  lowerIsBetter: z.boolean(),
  category: z.enum(benchmarkCategories),
  protocol: optionalNotes,
}).strict().refine((data) => data.unit !== 'custom' || Boolean(data.customUnit), {
  path: ['customUnit'],
  message: 'Enter a unit for this benchmark',
})

export const benchmarkResultSchema = z.object({
  benchmarkId: z.string().uuid(),
  date: calendarDate,
  value: z.number().finite().min(0).max(1_000_000),
  notes: optionalNotes,
}).strict()

export const goalMetrics = {
  bjj_sessions: 'BJJ sessions',
  mat_minutes: 'Mat minutes',
  strength_sessions: 'Strength workouts',
  mobility_minutes: 'Mobility minutes',
  conditioning_minutes: 'Conditioning minutes',
  recovery_check_ins: 'Recovery check-ins',
  solo_sessions: 'Solo drill sessions',
  benchmark: 'Benchmark',
} as const

const goalMetricKeys = [
  'bjj_sessions', 'mat_minutes', 'strength_sessions', 'mobility_minutes',
  'conditioning_minutes', 'recovery_check_ins', 'solo_sessions', 'benchmark',
] as const

export const goalSchema = z.object({
  metric: z.enum(goalMetricKeys),
  target: z.number().finite().positive().max(1_000_000),
  benchmarkId: z.string().uuid().optional(),
  name: name.optional(),
}).strict().superRefine((value, ctx) => {
  if ((value.metric === 'benchmark') !== Boolean(value.benchmarkId)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['benchmarkId'], message: 'Select a benchmark only for a benchmark goal' })
  }
  if (value.metric !== 'benchmark' && !Number.isInteger(value.target)) {
    ctx.addIssue({ code: z.ZodIssueCode.custom, path: ['target'], message: 'Enter a whole-number target' })
  }
})

export type RecoveryCheckIn = z.infer<typeof recoverySchema>
export type ReadinessRules = z.infer<typeof readinessRulesSchema>
export type DiscomfortEntry = z.infer<typeof discomfortSchema>
export type Benchmark = z.infer<typeof benchmarkSchema>
export type BenchmarkResult = z.infer<typeof benchmarkResultSchema>
export type TrainingGoal = z.infer<typeof goalSchema>

export const defaultReadinessRules: ReadinessRules = {
  enabled: false,
  minimumSleepHours: 7,
  maxSoreness: 3,
  maxFatigue: 3,
}

export const builtInBenchmarks: Benchmark[] = [
  { title: 'Strict pull-ups', unit: 'reps', category: 'strength', lowerIsBetter: false, protocol: 'Use the same grip and full range. Count strict reps before form changes.' },
  { title: 'Strict push-ups', unit: 'reps', category: 'strength', lowerIsBetter: false, protocol: 'Use a consistent hand position and depth. Count controlled reps.' },
  { title: 'Dead hang', unit: 'seconds', category: 'strength', lowerIsBetter: false, protocol: 'Use the same bar and grip. Record the time while maintaining a comfortable hold.' },
  { title: 'Farmer’s carry', unit: 'metres', category: 'strength', lowerIsBetter: false, protocol: 'Use a fixed load and course each time. Include the load per hand in your notes.' },
  { title: 'Forearm plank', unit: 'seconds', category: 'strength', lowerIsBetter: false, protocol: 'Time a steady hold. Stop when you can no longer maintain the same position.' },
  { title: 'Goblet squat', unit: 'kilograms', category: 'strength', lowerIsBetter: false, protocol: 'Choose a fixed rep target and depth. Repeat under similar conditions.' },
  { title: '2 km row', unit: 'minutes', category: 'conditioning', lowerIsBetter: true, protocol: 'Use the same machine and setting. Record elapsed time in minutes.' },
  { title: 'Knee-to-wall reach', unit: 'custom', customUnit: 'cm', category: 'mobility', lowerIsBetter: false, protocol: 'Measure in centimetres. Test one side consistently, keeping the heel down.' },
]

type Readiness = { label: string; reasons: string[] }

export function recommendReadiness(input: RecoveryCheckIn | undefined, rules: ReadinessRules): Readiness {
  if (!rules.enabled) return { label: 'Readiness is off', reasons: [] }
  if (input?.discomfort === 5) {
    return { label: 'Rest day', reasons: ['You reported the highest discomfort rating. Consider professional assessment if symptoms are serious, persistent or worsening.'] }
  }
  if (!input || input.sleepHours === undefined || input.soreness === undefined || input.fatigue === undefined) {
    return { label: 'Insufficient data', reasons: ['Record sleep hours, soreness and fatigue to see a suggestion.'] }
  }

  const poorSleep = input.sleepHours < rules.minimumSleepHours
  const highSoreness = input.soreness > rules.maxSoreness
  const highFatigue = input.fatigue > rules.maxFatigue
  const reasons = [
    poorSleep && `Sleep was below your ${rules.minimumSleepHours}-hour target.`,
    highSoreness && `Soreness exceeded your threshold of ${rules.maxSoreness} out of 5.`,
    highFatigue && `Fatigue exceeded your threshold of ${rules.maxFatigue} out of 5.`,
  ].filter((reason): reason is string => Boolean(reason))

  if (reasons.length === 3) return { label: 'Rest day', reasons }
  if (reasons.length === 2) return { label: 'Active recovery', reasons }
  if (highSoreness) return { label: 'Gentle mobility', reasons }
  if (highFatigue) return { label: 'Light technical training', reasons }
  if (poorSleep) return { label: 'Reduced intensity', reasons }
  return { label: 'Normal training', reasons: ['Sleep, soreness and fatigue met your configured thresholds.'] }
}

export function activeExerciseExclusions(entries: readonly DiscomfortEntry[]): string[] {
  return [...new Set(entries.filter((entry) => entry.status === 'ongoing').flatMap((entry) => entry.excludedExerciseSlugs))]
}

export type TrainingSample = {
  date: string
  category: 'bjj' | 'strength' | 'conditioning' | 'mobility' | 'solo' | 'recovery'
  durationMinutes?: number | null
  sessionRpe?: number | null
}

function hasDuration(sample: TrainingSample): sample is TrainingSample & { durationMinutes: number } {
  return Number.isFinite(sample.durationMinutes) && (sample.durationMinutes ?? 0) > 0
}

function hasRpe(sample: TrainingSample): sample is TrainingSample & { sessionRpe: number } {
  return Number.isFinite(sample.sessionRpe) && (sample.sessionRpe ?? -1) >= 0 && (sample.sessionRpe ?? 11) <= 10
}

function hasLoadData(sample: TrainingSample): sample is TrainingSample & { durationMinutes: number; sessionRpe: number } {
  return hasDuration(sample) && hasRpe(sample)
}

export function trainingLoad(samples: readonly TrainingSample[], start: string, end: string) {
  const period = samples.filter((sample) => sample.date >= start && sample.date <= end)
  const rated = period.filter(hasRpe)
  const measured = period.filter(hasLoadData)
  const byCategory: Partial<Record<TrainingSample['category'], number>> = {}
  const daily = new Map<string, number>()
  for (const sample of period.filter(hasDuration)) {
    byCategory[sample.category] = (byCategory[sample.category] ?? 0) + sample.durationMinutes
  }
  for (const sample of measured) {
    daily.set(sample.date, (daily.get(sample.date) ?? 0) + sample.durationMinutes * sample.sessionRpe)
  }
  const activeDays = new Set(period.filter((sample) => sample.category !== 'recovery').map((sample) => sample.date))
  const recoveryDays = new Set(period.filter((sample) => sample.category === 'recovery').map((sample) => sample.date))
  return {
    load: [...daily.values()].reduce((sum, value) => sum + value, 0),
    sessions: period.length,
    measuredSessions: measured.length,
    averageRpe: rated.length ? rated.reduce((sum, sample) => sum + sample.sessionRpe, 0) / rated.length : null,
    highIntensityDays: new Set(rated.filter((sample) => sample.sessionRpe >= 8).map((sample) => sample.date)).size,
    activeDays: activeDays.size,
    recoveryDays: recoveryDays.size,
    byCategory,
    daily,
  }
}

export function weeklyGoalProgress(
  goal: TrainingGoal,
  samples: readonly TrainingSample[],
  checkIns: readonly RecoveryCheckIn[],
  start: string,
  end: string,
  benchmark?: Benchmark,
  results: readonly BenchmarkResult[] = [],
) {
  if (goal.metric === 'benchmark') {
    const values = results.filter((result) => result.benchmarkId === goal.benchmarkId).map((result) => result.value)
    if (!benchmark || values.length === 0) return { value: null, reached: false }
    const value = benchmark.lowerIsBetter ? Math.min(...values) : Math.max(...values)
    return { value, reached: benchmark.lowerIsBetter ? value <= goal.target : value >= goal.target }
  }
  const week = samples.filter((sample) => sample.date >= start && sample.date <= end)
  const count = (category: TrainingSample['category']) => week.filter((sample) => sample.category === category).length
  const minutes = (category: TrainingSample['category']) => week.filter(hasDuration).filter((sample) => sample.category === category).reduce((sum, sample) => sum + sample.durationMinutes, 0)
  const totals: Record<Exclude<TrainingGoal['metric'], 'benchmark'>, () => number> = {
    bjj_sessions: () => count('bjj'),
    mat_minutes: () => minutes('bjj'),
    strength_sessions: () => count('strength'),
    mobility_minutes: () => minutes('mobility'),
    conditioning_minutes: () => minutes('conditioning'),
    recovery_check_ins: () => new Set(checkIns.filter((checkIn) => checkIn.date >= start && checkIn.date <= end).map((checkIn) => checkIn.date)).size,
    solo_sessions: () => count('solo'),
  }
  const value = totals[goal.metric]()
  return { value, reached: value >= goal.target }
}

export type StrengthResult = {
  date: string
  exercises: readonly {
    exerciseSlug: string
    name: string
    sets?: readonly { weightKg?: number; repetitions?: number; holdSeconds?: number; kind: 'working' | 'warmup'; completed: boolean }[]
  }[]
}

export function strengthRecords(results: readonly StrengthResult[]) {
  const records = new Map<string, {
    name: string
    heaviestKg: number | null
    estimatedOneRepMaxKg: number | null
    longestHoldSeconds: number | null
    volumeKg: number
    sets: { date: string; weightKg?: number; repetitions?: number; holdSeconds?: number }[]
  }>()
  for (const workout of results) {
    for (const exercise of workout.exercises) {
      const sets = exercise.sets?.filter((set) => set.completed && set.kind === 'working') ?? []
      if (sets.length === 0) continue
      const record = records.get(exercise.exerciseSlug) ?? {
        name: exercise.name, heaviestKg: null, estimatedOneRepMaxKg: null, longestHoldSeconds: null, volumeKg: 0, sets: [],
      }
      for (const { weightKg, repetitions, holdSeconds } of sets) {
        record.sets.push({ date: workout.date, weightKg, repetitions, holdSeconds })
        if (holdSeconds !== undefined && holdSeconds > 0) {
          record.longestHoldSeconds = Math.max(record.longestHoldSeconds ?? 0, holdSeconds)
        }
        if (weightKg === undefined || weightKg <= 0 || !repetitions || repetitions < 1) continue
        record.heaviestKg = Math.max(record.heaviestKg ?? 0, weightKg)
        record.volumeKg += weightKg * repetitions
        if (repetitions >= 2 && repetitions <= 10) {
          const estimate = weightKg * (1 + repetitions / 30)
          record.estimatedOneRepMaxKg = Math.max(record.estimatedOneRepMaxKg ?? 0, estimate)
        }
      }
      records.set(exercise.exerciseSlug, record)
    }
  }
  return [...records].map(([slug, record]) => ({ slug, ...record })).sort((left, right) => left.name.localeCompare(right.name))
}

export function fitnessMilestones(samples: readonly TrainingSample[], firstMeasuredStrengthDate: string | undefined, today: string) {
  const ordered = samples.filter((sample) => sample.date <= today).slice().sort((left, right) => left.date.localeCompare(right.date))
  const mobility = ordered.filter((sample) => sample.category === 'mobility')
  const preparation = new Set(['strength', 'mobility', 'conditioning', 'solo'])
  const completeWeeks = new Map<string, TrainingSample[]>()
  for (const sample of ordered.filter((item) => item.category !== 'recovery')) {
    const start = firstDayOfWeek(sample.date)
    if (addCalendarDays(start, 6) >= today) continue
    const week = completeWeeks.get(start) ?? []
    week.push(sample)
    completeWeeks.set(start, week)
  }

  let consecutive = 0
  let previousWeek: string | undefined
  let firstConsistent: string | undefined
  let firstBalanced: string | undefined
  for (const [week, entries] of completeWeeks) {
    const weekEnd = addCalendarDays(week, 6)
    const days = new Set(entries.map((entry) => entry.date))
    if (days.size < 7 && entries.some((entry) => entry.category === 'bjj') && entries.some((entry) => preparation.has(entry.category))) {
      firstBalanced ??= weekEnd
    }
    consecutive = previousWeek && addCalendarDays(previousWeek, 7) === week ? consecutive + 1 : 1
    if (consecutive === 4) firstConsistent ??= weekEnd
    previousWeek = week
  }
  let mobilityMinutes = 0
  const hundredMinutes = mobility.find((entry) => {
    mobilityMinutes += entry.durationMinutes ?? 0
    return mobilityMinutes >= 100
  })

  return [
    { id: 'first-strength', title: 'First strength workout', detail: 'Complete a strength session.', earnedDate: ordered.find((item) => item.category === 'strength')?.date },
    { id: 'first-solo', title: 'First solo drill session', detail: 'Complete a solo drill session.', earnedDate: ordered.find((item) => item.category === 'solo')?.date },
    { id: 'mobility-minutes', title: '100 mobility minutes', detail: 'Accumulate 100 minutes of mobility work.', earnedDate: hundredMinutes?.date },
    { id: 'mobility-routines', title: 'Ten mobility routines', detail: 'Complete ten mobility sessions.', earnedDate: mobility[9]?.date },
    { id: 'strength-record', title: 'First strength record', detail: 'Record the weight and repetitions of a completed working set.', earnedDate: firstMeasuredStrengthDate },
    { id: 'balanced-week', title: 'Balanced training week', detail: 'In a completed week, log a mat session, a preparation session and leave at least one day without training.', earnedDate: firstBalanced },
    { id: 'consistent-weeks', title: 'Four weeks of consistent training', detail: 'Log training in four consecutive completed weeks. Rest days do not count against you.', earnedDate: firstConsistent },
  ]
}
