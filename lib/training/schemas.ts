import { z } from 'zod'
import {
  benchmarkResultSchema,
  benchmarkSchema,
  discomfortSchema,
  goalSchema,
  readinessRulesSchema,
  recoverySchema,
} from './performance'

export const uuid = z.string().uuid()
export const version = z.number().int().positive().max(2147483647)
const text = (max: number) => z.string().trim().max(max)
const title = text(200).min(1)
const integer = (min: number, max: number) => z.number().int().min(min).max(max)
const optionalText = (max: number) => text(max).optional()
const note = optionalText(4000)
const instant = z.string().datetime({ offset: true })
export const localDate = z.string().date()
const slug = text(160).min(1)
export const timeZone = z.string().max(100).refine((zone) => {
  try {
    new Intl.DateTimeFormat('en', { timeZone: zone })
    return true
  } catch {
    return false
  }
}, 'Invalid time zone')

export const workoutCategory = z.enum(['mobility', 'strength', 'conditioning', 'solo', 'recovery'])
export const activityCategory = z.enum([
  'bjj_gi', 'bjj_no_gi', 'open_mat', 'strength', 'mobility', 'conditioning',
  'solo', 'recovery', 'rest', 'competition', 'private_lesson',
])

const setSchema = z.object({
  id: text(80).min(1),
  repetitions: integer(0, 1000).optional(),
  weightKg: z.number().finite().min(0).max(1500).optional(),
  restSeconds: integer(0, 3600).optional(),
  rpe: z.number().finite().min(0).max(10).optional(),
  rir: integer(0, 20).optional(),
  tempo: optionalText(40),
  kind: z.enum(['warmup', 'working']),
  holdSeconds: integer(0, 10800).optional(),
  completed: z.boolean(),
}).strict()

const stepSchema = z.object({
  exerciseSlug: slug,
  name: title,
  illustration: z.string().max(400).regex(/^\/training\/[a-z0-9/_-]+\.svg$/i).optional(),
  durationSeconds: integer(0, 14400).optional(),
  repetitions: integer(0, 10000).optional(),
  repetitionsCompleted: integer(0, 10000).optional(),
  sides: z.boolean().optional(),
  restSeconds: integer(0, 3600).optional(),
  notes: note,
  setGroup: optionalText(60),
  groupType: z.enum(['superset', 'circuit']).optional(),
  sets: z.array(setSchema).max(60).optional(),
}).strict().refine((step) => {
  const ids = step.sets?.map((set) => set.id) ?? []
  return new Set(ids).size === ids.length
}, 'Each set must have a unique ID within its exercise')

export const workoutSchema = z.object({
  title,
  category: workoutCategory,
  plannedActivityId: uuid.optional(),
  templateId: uuid.optional(),
  templateSlug: slug.optional(),
  status: z.enum(['in_progress', 'completed']),
  startedAt: instant,
  completedAt: instant.optional(),
  durationMinutes: integer(1, 1440).optional(),
  sessionRpe: z.number().finite().min(0).max(10).optional(),
  exercises: z.array(stepSchema).max(100),
  notes: note,
  elapsedSeconds: integer(0, 86400),
  pausedAt: instant.optional(),
  runningSince: instant.optional(),
  currentStep: integer(0, 100).optional(),
  currentSide: integer(0, 2).optional(),
  stepElapsedSeconds: integer(0, 86400).optional(),
  stepRunningSince: instant.optional(),
  resting: z.boolean().optional(),
  restDurationSeconds: integer(0, 3600).optional(),
  restEndsAt: instant.optional(),
  skipped: z.array(integer(0, 99)).max(100).optional(),
  reviewTechniqueIds: z.array(uuid).max(100).optional(),
  distanceKm: z.number().finite().min(0).max(1000).optional(),
  averageHeartRate: integer(20, 250).optional(),
  maximumHeartRate: integer(20, 250).optional(),
}).strict().refine((data) =>
  data.averageHeartRate === undefined || data.maximumHeartRate === undefined
  || data.averageHeartRate <= data.maximumHeartRate,
'Maximum heart rate must equal or exceed average heart rate')

export const activitySchema = z.object({
  title,
  category: activityCategory,
  date: localDate,
  time: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/).optional(),
  timeZone,
  durationMinutes: integer(0, 1440),
  status: z.enum(['planned', 'in_progress', 'completed', 'skipped', 'cancelled']),
  repeat: z.object({
    intervalWeeks: integer(1, 52),
    until: localDate.optional(),
    exceptions: z.array(localDate).max(366).optional(),
  }).strict().optional(),
  reminderMinutes: integer(0, 1440).optional(),
  seriesId: uuid.optional(),
  occurrenceDate: localDate.optional(),
  templateSlug: slug.optional(),
  workoutTemplateId: uuid.optional(),
  journalEntryId: uuid.optional(),
  notes: note,
}).strict().superRefine((value, context) => {
  if (Boolean(value.seriesId) !== Boolean(value.occurrenceDate) || (value.seriesId && value.repeat)) {
    context.addIssue({ code: 'custom', path: ['seriesId'], message: 'An occurrence needs a series and an original date' })
  }
  if (value.repeat?.until && value.repeat.until < value.date) {
    context.addIssue({ code: 'custom', path: ['repeat', 'until'], message: 'Recurrence ends before the first activity' })
  }
})

const programmeActivitySchema = z.object({
  weekday: integer(0, 6),
  category: activityCategory,
  title,
  durationMinutes: integer(0, 1440),
  templateId: slug.optional(),
  intensity: z.enum(['easy', 'moderate', 'hard']),
  rationale: optionalText(1000),
}).strict()

const preferencesSchema = z.object({
  key: z.enum(['dashboard', 'readiness', 'training', 'units']),
  widgetOrder: z.array(text(80)).max(40).optional(),
  hiddenWidgets: z.array(text(80)).max(40).optional(),
  readiness: readinessRulesSchema.optional(),
  weightUnit: z.enum(['kg', 'lb']).optional(),
  timeZone: timeZone.optional(),
}).strict()

export const trainingSchemas = {
  workouts: workoutSchema,
  activities: activitySchema,
  templates: z.object({
    title, category: workoutCategory, description: text(4000),
    favourite: z.boolean(), steps: z.array(stepSchema).max(100),
  }).strict(),
  exercises: z.object({
    name: title,
    category: workoutCategory,
    description: text(2000),
    instructions: z.array(text(500).min(1)).min(1).max(20),
    bodyRegions: z.array(text(80)).max(20),
    difficulty: z.enum(['beginner', 'intermediate', 'advanced']),
    equipment: z.array(text(100)).max(20),
    dosage: text(500),
    safety: z.array(text(500)).max(20),
    movementPattern: text(150),
    bjjRelevance: text(1000),
    variations: z.object({ easier: text(500), harder: text(500) }).strict().optional(),
    commonMistakes: z.array(text(500)).max(20).optional(),
  }).strict(),
  exercise_favourites: z.object({ exerciseSlug: slug }).strict(),
  preferences: preferencesSchema,
  recovery: recoverySchema,
  discomfort: discomfortSchema,
  benchmarks: benchmarkSchema,
  'benchmark-results': benchmarkResultSchema,
  goals: goalSchema,
  competitions: z.object({
    name: title, date: localDate, discipline: z.enum(['gi', 'no-gi']),
    weightClass: optionalText(100), ruleSet: optionalText(200), matchMinutes: integer(1, 120).optional(),
    goals: note, blocks: note, checklist: z.array(z.object({ text: title, done: z.boolean() }).strict()).max(60).optional(),
    reflection: note,
  }).strict(),
  reflections: z.object({ weekStart: localDate, improved: note, difficulties: note, focus: note, physical: note }).strict(),
  programmes: z.object({
    name: title,
    goal: optionalText(500),
    weeks: z.array(z.object({ activities: z.array(programmeActivitySchema).max(35) }).strict()).min(1).max(52),
    notes: note,
  }).strict(),
} satisfies Record<string, z.ZodTypeAny>

export type TrainingCollection = keyof typeof trainingSchemas
export type TrainingData<K extends TrainingCollection> = z.infer<(typeof trainingSchemas)[K]>

export function isTrainingCollection(collection: string): collection is TrainingCollection {
  return Object.hasOwn(trainingSchemas, collection)
}
