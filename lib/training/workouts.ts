import type { TrainingCategory, CatalogExercise, RoutineStep, CatalogRoutine, CatalogProgramme } from './catalog/types'

export type WeightUnit = 'kg' | 'lb'
export type IntervalFormat = 'emom' | 'amrap' | 'tabata' | 'sparring' | 'custom'

export const categoryLabels: Record<TrainingCategory, string> = {
  mobility: 'Mobility',
  strength: 'Strength',
  conditioning: 'Conditioning',
  solo: 'Solo drills',
  recovery: 'Recovery routines',
}

export const categoryDescriptions: Record<TrainingCategory, string> = {
  mobility: 'Build range and control for the positions you train on the mat.',
  strength: 'Plan sets, track lifts, and build strength you can take into your next round.',
  conditioning: 'Log aerobic work, intervals, and rounds alongside your mat time.',
  solo: 'Rehearse grappling movement and revisit techniques from your personal library.',
  recovery: 'Give yourself space for easier movement around harder training days.',
}

export interface WorkoutSet {
  id: string
  repetitions?: number
  weightKg?: number
  restSeconds?: number
  rpe?: number
  rir?: number
  tempo?: string
  holdSeconds?: number
  kind: 'warmup' | 'working'
  completed: boolean
}

export interface WorkoutStep {
  exerciseSlug: string
  name: string
  illustration?: string
  durationSeconds?: number
  repetitions?: number
  repetitionsCompleted?: number
  sides?: boolean
  restSeconds?: number
  notes?: string
  setGroup?: string
  groupType?: 'superset' | 'circuit'
  sets?: WorkoutSet[]
}

export interface WorkoutTemplate {
  title: string
  description: string
  category: TrainingCategory
  favourite: boolean
  steps: WorkoutStep[]
}

export interface WorkoutSession {
  title: string
  category: TrainingCategory
  plannedActivityId?: string
  status: 'in_progress' | 'completed'
  startedAt: string
  completedAt?: string
  durationMinutes?: number
  sessionRpe?: number
  exercises: WorkoutStep[]
  notes?: string
  elapsedSeconds: number
  pausedAt?: string
  runningSince?: string
  currentStep?: number
  currentSide?: number
  skipped?: number[]
  stepElapsedSeconds?: number
  stepRunningSince?: string
  resting?: boolean
  restDurationSeconds?: number
  restEndsAt?: string
  distanceKm?: number
  averageHeartRate?: number
  maximumHeartRate?: number
  reviewTechniqueIds?: string[]
}

export function fromKilograms(kilograms: number, unit: WeightUnit) {
  return unit === 'lb' ? kilograms / 0.45359237 : kilograms
}

export function toKilograms(weight: number, unit: WeightUnit) {
  const kilograms = unit === 'lb' ? weight * 0.45359237 : weight
  return Math.round(kilograms * 1_000_000) / 1_000_000
}

export function elapsedSeconds(saved: number, since: string | undefined, now: number) {
  return saved + (since ? Math.max(0, Math.floor((now - Date.parse(since)) / 1000)) : 0)
}

export function clockLabel(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  const minutes = Math.floor(total / 60)
  return `${String(minutes).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

export function newWorkoutSet(defaults: Partial<WorkoutSet> = {}): WorkoutSet {
  return { kind: 'working', ...defaults, id: crypto.randomUUID(), completed: false }
}

export function exerciseStep(exercise: Pick<CatalogExercise, 'slug' | 'name' | 'category'> & { illustration?: CatalogExercise['illustration'] }): WorkoutStep {
  return {
    exerciseSlug: exercise.slug,
    name: exercise.name,
    illustration: exercise.illustration?.src,
    ...(exercise.category === 'strength' ? { sets: [newWorkoutSet({ repetitions: 8, restSeconds: 90 })] } : {}),
  }
}

export function routineTemplate(
  routine: CatalogRoutine,
  findExercise: (slug: string) => Pick<CatalogExercise, 'slug' | 'name' | 'category' | 'illustration'> | undefined,
): WorkoutTemplate {
  const steps = routine.steps.flatMap((step: RoutineStep) => {
    const exercise = findExercise(step.exerciseSlug)
    if (!exercise) return []
    return [{
      ...exerciseStep(exercise),
      durationSeconds: step.durationSeconds,
      repetitions: step.repetitions,
      restSeconds: step.restSeconds,
      sides: step.sides === 'left-right',
    }]
  })
  return { title: routine.name, description: routine.description, category: routine.category, favourite: false, steps }
}

export function programmeTemplate(
  programme: CatalogProgramme,
  day: number,
  findExercise: Parameters<typeof routineTemplate>[1],
  options?: { deload?: boolean; substitutions?: ReadonlyMap<number, string> },
): WorkoutTemplate | undefined {
  const session = programme.schedule.find(item => item.day === day)
  if (!session) return
  return {
    title: session.name,
    description: programme.description,
    category: 'strength',
    favourite: false,
    steps: session.exercises.flatMap((entry, index) => {
      const substitution = options?.substitutions?.get(index)
      const selectedSlug = substitution && entry.substitutions.includes(substitution) ? substitution : entry.exerciseSlug
      const exercise = findExercise(selectedSlug)
      if (!exercise) return []
      return [{
        ...exerciseStep(exercise),
        sets: Array.from({ length: options?.deload ? Math.ceil(entry.sets / 2) : entry.sets }, () => newWorkoutSet({
          repetitions: entry.repetitions,
          restSeconds: entry.restSeconds,
          rpe: entry.effort,
        })),
      }]
    }),
  }
}

export function blankTemplate(category: TrainingCategory): WorkoutTemplate {
  return { title: '', description: '', category, favourite: false, steps: [] }
}

export function intervalSteps(
  format: IntervalFormat, rounds: number, work: number, rest: number, warmup: number, cooldown: number,
): WorkoutStep[] {
  const label: Record<IntervalFormat, string> = {
    emom: 'EMOM', amrap: 'AMRAP', tabata: 'Tabata', sparring: 'Sparring', custom: 'Work',
  }
  const steps: WorkoutStep[] = Array.from({ length: format === 'amrap' ? 1 : rounds }, (_, index) => ({
    exerciseSlug: 'interval-work',
    name: format === 'amrap' ? 'AMRAP' : `${label[format]} round ${index + 1}`,
    durationSeconds: work,
    restSeconds: format !== 'amrap' && index < rounds - 1 ? rest : undefined,
  }))
  if (warmup) steps.unshift({ exerciseSlug: 'interval-warmup', name: 'Warm-up', durationSeconds: warmup })
  if (cooldown) steps.push({ exerciseSlug: 'interval-cooldown', name: 'Cooldown', durationSeconds: cooldown })
  return steps
}

export function createWorkout(template: WorkoutTemplate, plannedActivityId?: string): WorkoutSession {
  const startedAt = new Date().toISOString()
  return {
    title: template.title.trim(),
    category: template.category,
    status: 'in_progress',
    plannedActivityId,
    startedAt,
    elapsedSeconds: 0,
    runningSince: startedAt,
    currentStep: 0,
    currentSide: 0,
    stepElapsedSeconds: 0,
    stepRunningSince: startedAt,
    exercises: template.steps.map(step => ({
      ...step,
      sets: step.sets?.map(set => ({ ...set, id: crypto.randomUUID(), completed: false })),
    })),
  }
}


export function workoutElapsed(workout: WorkoutSession, now: number) {
  return Math.min(86400, elapsedSeconds(workout.elapsedSeconds, workout.runningSince, now))
}

export function blockElapsed(workout: WorkoutSession, now: number) {
  return Math.min(86400, elapsedSeconds(workout.stepElapsedSeconds ?? 0, workout.stepRunningSince, now))
}

export function restRemaining(workout: WorkoutSession, now: number) {
  return workout.restEndsAt
    ? Math.max(0, Math.ceil((Date.parse(workout.restEndsAt) - now) / 1000))
    : workout.restDurationSeconds ?? 0
}

export function pauseWorkout(workout: WorkoutSession, now: number): WorkoutSession {
  if (workout.pausedAt) return workout
  return {
    ...workout, pausedAt: new Date(now).toISOString(),
    elapsedSeconds: workoutElapsed(workout, now),
    stepElapsedSeconds: blockElapsed(workout, now),
    restDurationSeconds: restRemaining(workout, now),
    runningSince: undefined, stepRunningSince: undefined, restEndsAt: undefined,
  }
}

export function resumeWorkout(workout: WorkoutSession, now: number): WorkoutSession {
  const stamp = new Date(now).toISOString()
  const rest = workout.restDurationSeconds ?? 0
  return {
    ...workout, pausedAt: undefined, runningSince: stamp,
    stepRunningSince: stamp,
    restEndsAt: rest > 0 ? new Date(now + rest * 1000).toISOString() : undefined,
  }
}

export function advanceGuided(
  workout: WorkoutSession, direction: 'next' | 'back' | 'skip', now: number,
): WorkoutSession {
  const index = workout.currentStep ?? 0
  const step = workout.exercises[index]
  const stamp = new Date(now).toISOString()
  const reset = {
    ...workout, resting: false, currentSide: 0, stepElapsedSeconds: 0,
    stepRunningSince: workout.pausedAt ? undefined : stamp,
  }
  if (direction === 'back') {
    if (workout.resting || (workout.currentSide ?? 0) > 0) return reset
    return { ...reset, currentStep: Math.max(0, index - 1) }
  }
  if (workout.resting) return { ...reset, currentStep: index + 1 }
  if (!step) return workout
  if (direction === 'skip') return {
    ...reset, currentStep: index + 1,
    skipped: Array.from(new Set([...(workout.skipped ?? []), index])),
  }
  const unskip = workout.skipped?.filter(skipped => skipped !== index)
  if (step.sides && !workout.currentSide) return { ...reset, currentSide: 1, skipped: unskip }
  if (step.restSeconds && index < workout.exercises.length - 1) return { ...reset, resting: true, skipped: unskip }
  return { ...reset, currentStep: index + 1, skipped: unskip }
}

export function strengthNextExercise(workout: WorkoutSession, currentIndex: number) {
  const exercise = workout.exercises[currentIndex]
  const group = exercise?.setGroup
  if (!group || !exercise.groupType) return { index: currentIndex, rest: true }
  const groupMembers = workout.exercises
    .map((item, index) => ({ item, index }))
    .filter(({ item }) => item.setGroup === group && item.groupType === exercise.groupType)
    .filter(({ item }) => item.sets?.some(set => !set.completed))
  const next = groupMembers.find(({ index }) => index > currentIndex)
  if (next) return { index: next.index, rest: false }
  return { index: groupMembers[0]?.index ?? currentIndex, rest: true }
}

export function advanceConditioningAt(workout: WorkoutSession, now: number) {
  if (workout.category !== 'conditioning' || workout.pausedAt) return workout
  let updated = workout
  while (updated.stepRunningSince) {
    const step = updated.exercises[updated.currentStep ?? 0]
    const length = updated.resting ? step?.restSeconds : step?.durationSeconds
    if (!length || blockElapsed(updated, now) < length) break
    const boundary = Date.parse(updated.stepRunningSince) + Math.max(0, length - (updated.stepElapsedSeconds ?? 0)) * 1000
    updated = advanceGuided(updated, 'next', boundary)
    if ((updated.currentStep ?? 0) >= updated.exercises.length) return pauseWorkout(updated, boundary)
  }
  return updated
}
