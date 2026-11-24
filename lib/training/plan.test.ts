import { generateTrainingWeek, isoWeekStart, scheduleWeek, type PlanInput, type PlanOption } from './plan'

const input: PlanInput = {
  weekStart: '2026-03-23', timeZone: 'Europe/Berlin', belt: 'blue',
  bjjExperience: 'regular', strengthExperience: 'new', goal: 'strength', availableMinutes: 250,
  weeklyMatSessions: 2, fixedDays: [0, 3], restDays: [6], equipment: [], mobilityPriorities: [],
  excludedExercises: ['excluded-press'],
}
const options: PlanOption[] = [
  { slug: 'bodyweight-strength', title: 'Bodyweight strength', category: 'strength', durationMinutes: 30, intensity: 'moderate', equipment: [], exerciseSlugs: ['push-up'] },
  { slug: 'excluded-strength', title: 'Excluded strength', category: 'strength', durationMinutes: 10, intensity: 'moderate', equipment: [], exerciseSlugs: ['excluded-press'] },
  { slug: 'equipment-strength', title: 'Equipment strength', category: 'strength', durationMinutes: 10, intensity: 'moderate', equipment: ['barbell'], exerciseSlugs: ['squat'] },
  { slug: 'hip-mobility', title: 'Hip mobility', category: 'mobility', durationMinutes: 15, intensity: 'easy', equipment: ['mat'], exerciseSlugs: ['hip-switch'] },
]

it('preserves fixed mat days, avoids adjacent intensity, and respects exclusions and rest', () => {
  const { activities } = generateTrainingWeek(input, options)
  expect(activities.filter(a => a.category === 'bjj_gi').map(a => a.weekday)).toEqual([0, 3])
  expect(activities).toContainEqual(expect.objectContaining({ category: 'rest', weekday: 6 }))
  expect(activities.map(a => a.templateId)).not.toEqual(expect.arrayContaining(['excluded-strength', 'equipment-strength']))
  const strength = activities.find(a => a.category === 'strength')
  expect(strength).toMatchObject({ weekday: 5, templateId: 'bodyweight-strength' })
  expect(activities.reduce((sum, a) => sum + a.durationMinutes, 0)).toBeLessThanOrEqual(input.availableMinutes)
})

it('only adds easy supplemental work when tapering', () => {
  const { activities } = generateTrainingWeek({ ...input, competitionDate: '2026-03-29' }, options)
  expect(activities).toContainEqual(expect.objectContaining({ category: 'competition', weekday: 6 }))
  expect(activities.some(a => a.category === 'strength')).toBe(false)
})

it('counts calendar mat sessions toward the goal without adding a duplicate', () => {
  const { activities, notices } = generateTrainingWeek({
    ...input, existing: [{ weekday: 0, category: 'bjj_gi', durationMinutes: 90, intensity: 'hard' }],
  }, options)
  expect(activities.filter(a => a.category === 'bjj_gi').map(a => a.weekday)).toEqual([3])
  expect(notices.join(' ')).toMatch(/existing calendar/)
})

it('keeps calendar dates stable through the daylight-saving transition', () => {
  const start = isoWeekStart('2026-03-29')
  const { activities } = generateTrainingWeek(input, options)
  expect(start).toBe('2026-03-23')
  expect(scheduleWeek(activities, start, input.timeZone).at(-1)).toMatchObject({
    date: '2026-03-29', timeZone: 'Europe/Berlin',
  })
})
