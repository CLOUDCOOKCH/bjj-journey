export const trainingCategories = ['mobility', 'strength', 'conditioning', 'solo', 'recovery'] as const
export type TrainingCategory = typeof trainingCategories[number]

export const bodyRegions = [
  'hips', 'hip-flexors', 'adductors', 'hamstrings', 'glutes', 'ankles', 'knees', 'thoracic-spine',
  'shoulders', 'wrists', 'neck', 'core', 'back', 'chest', 'arms', 'forearms', 'full-body',
] as const
export type BodyRegion = typeof bodyRegions[number]
export type Difficulty = 'beginner' | 'intermediate' | 'advanced'

export interface CatalogExercise {
  slug: string
  name: string
  category: TrainingCategory
  description: string
  instructions: string[]
  bodyRegions: BodyRegion[]
  targetMuscles?: string[]
  substitutions?: string[]
  difficulty: Difficulty
  equipment: string[]
  dosage: string
  commonMistakes: string[]
  safety: string[]
  variations: { easier: string; harder: string }
  bjjRelevance: string
  movementPattern: string
  illustration: { src: string; alt: string }
  source: { name: string; license: string }
  videoUrl?: string
}

export type CatalogExerciseInput = Omit<CatalogExercise, 'category' | 'illustration' | 'source'>

export function defineExercises(category: TrainingCategory, content: CatalogExerciseInput[]): CatalogExercise[] {
  return content.map(exercise => ({
    ...exercise,
    category,
    illustration: {
      src: `/training/exercises/${exercise.slug}.svg`,
      alt: `${exercise.name} exercise illustration`,
    },
    source: { name: 'BJJ Journey original exercise content and illustration', license: 'Project original' },
  }))
}

export interface RoutineStep {
  exerciseSlug: string
  durationSeconds?: number
  repetitions?: number
  sides?: 'left-right'
  restSeconds?: number
}

export interface CatalogRoutine {
  slug: string
  name: string
  category: TrainingCategory
  description: string
  durationMinutes: number
  style: 'dynamic' | 'static' | 'mixed' | 'interval' | 'strength' | 'recovery'
  steps: RoutineStep[]
}

export interface ProgrammeExercise {
  exerciseSlug: string
  substitutions: string[]
  sets: number
  repetitions: number
  restSeconds: number
  effort: number
}

export interface CatalogProgramme {
  slug: string
  name: string
  description: string
  weeks: number
  difficulty: Difficulty
  optionalDeloadWeek: number
  schedule: { day: number; name: string; exercises: ProgrammeExercise[] }[]
}
