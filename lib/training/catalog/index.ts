import { conditioningExercises } from './conditioning'
import { mobilityExercises } from './mobility'
import { recoveryExercises } from './recovery'
import { soloExercises } from './solo'
import { strengthExercises } from './strength'

export { equipmentChoices, hasRequiredEquipment } from './equipment'
export { routineCatalog } from './routines'
export { programmeCatalog } from './programmes'
export * from './types'

export const exerciseCatalog = [
  ...mobilityExercises,
  ...strengthExercises,
  ...conditioningExercises,
  ...soloExercises,
  ...recoveryExercises,
]

const exercisesBySlug = new Map(exerciseCatalog.map(exercise => [exercise.slug, exercise]))

export function getCatalogExercise(slug: string) {
  return exercisesBySlug.get(slug)
}
