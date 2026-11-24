import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { bodyRegions, equipmentChoices, exerciseCatalog, getCatalogExercise, hasRequiredEquipment, programmeCatalog, routineCatalog } from '.'

describe('BJJ exercise catalog', () => {
  it('has enough curated exercises in each category with unique stable IDs', () => {
    const minimums = { mobility: 40, strength: 50, conditioning: 15, solo: 20, recovery: 10 }
    expect(new Set(exerciseCatalog.map(exercise => exercise.slug)).size).toBe(exerciseCatalog.length)

    for (const [category, minimum] of Object.entries(minimums)) {
      expect(exerciseCatalog.filter(exercise => exercise.category === category).length).toBeGreaterThanOrEqual(minimum)
    }

    for (const exercise of exerciseCatalog) {
      expect(exercise.slug).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(getCatalogExercise(exercise.slug)).toBe(exercise)
      expect(exercise.instructions.length).toBeGreaterThanOrEqual(3)
      expect(exercise.safety[0]).toBeTruthy()
      expect(exercise.bjjRelevance).toBeTruthy()
      expect(exercise.bodyRegions.every(region => bodyRegions.includes(region))).toBe(true)
      expect(exercise.source.license).toBe('Project original')
      const illustration = readFileSync(join(process.cwd(), 'public', exercise.illustration.src), 'utf8')
      expect(illustration).toContain('<svg')
      expect(illustration).toContain('aria-labelledby="title desc"')

      if (exercise.category === 'strength') {
        expect(exercise.targetMuscles?.length).toBeGreaterThan(0)
        expect(exercise.substitutions?.length).toBeGreaterThan(0)
        expect(exercise.substitutions?.every(slug => Boolean(getCatalogExercise(slug)) && slug !== exercise.slug)).toBe(true)
      }
    }
  })

  it('resolves routine steps and counts both sides and rest in named durations', () => {
    expect(new Set(routineCatalog.map(routine => routine.slug)).size).toBe(routineCatalog.length)
    expect(routineCatalog.filter(routine => routine.category === 'mobility')).toHaveLength(10)
    expect(routineCatalog.filter(routine => routine.category === 'solo').map(routine => routine.durationMinutes)).toEqual([5, 10, 15, 20])

    for (const routine of routineCatalog) {
      let total = 0
      for (const step of routine.steps) {
        expect(getCatalogExercise(step.exerciseSlug)).toBeDefined()
        expect(Boolean(step.durationSeconds) !== Boolean(step.repetitions)).toBe(true)
        total += (step.durationSeconds ?? 0) * (step.sides ? 2 : 1) + (step.restSeconds ?? 0)
      }
      if (routine.style !== 'strength') expect(total).toBe(routine.durationMinutes * 60)
      const namedDuration = /^(\d+)-minute/.exec(routine.name)?.[1]
      if (namedDuration) expect(routine.durationMinutes).toBe(Number(namedDuration))
    }
  })

  it('supplies multi-week programmes with valid schedules and choices', () => {
    expect(new Set(programmeCatalog.map(programme => programme.slug)).size).toBe(10)

    for (const programme of programmeCatalog) {
      const days = programme.schedule.map(day => day.day)
      expect(new Set(days).size).toBe(days.length)
      expect(days.every(day => day >= 1 && day <= 7)).toBe(true)
      expect(programme.weeks).toBeGreaterThan(1)
      expect(programme.optionalDeloadWeek).toBe(programme.weeks)

      for (const day of programme.schedule) {
        expect(day.exercises.length).toBeGreaterThanOrEqual(2)
        for (const exercise of day.exercises) {
          expect(getCatalogExercise(exercise.exerciseSlug)?.category).toBe('strength')
          expect(exercise.substitutions.every(slug => Boolean(getCatalogExercise(slug)))).toBe(true)
          expect(exercise.sets).toBeGreaterThan(0)
          expect(exercise.repetitions).toBeGreaterThan(0)
          expect(exercise.effort).toBeLessThan(8)
        }
      }
    }
  })

  it('accepts suitable equipment alternatives without requiring both choices', () => {
    expect(equipmentChoices(['Dumbbell or kettlebell', 'Dumbbell', 'Mat'])).toEqual(['Dumbbell', 'Kettlebell'])
    expect(hasRequiredEquipment('Dumbbell or kettlebell', ['Kettlebell'])).toBe(true)
    expect(hasRequiredEquipment('Dumbbell', ['Two dumbbells'])).toBe(true)
    expect(hasRequiredEquipment('Two dumbbells or kettlebells', ['Kettlebell'])).toBe(false)
    expect(hasRequiredEquipment('Mat or chair', [])).toBe(true)
    expect(hasRequiredEquipment('Rebound-rated wall', ['Wall'])).toBe(false)
  })

  it('includes front and back body map assets', () => {
    for (const side of ['front', 'back']) {
      expect(existsSync(join(process.cwd(), 'public', 'training', `body-${side}.svg`))).toBe(true)
    }
  })
})
