import { hasRequiredEquipment } from './catalog/equipment'
import type { TrainingData } from './schemas'

export type PlanGoal = 'flexibility' | 'guard-mobility' | 'strength' | 'endurance' | 'grip' | 'explosiveness' | 'recovery' | 'competition' | 'fitness'
type Activity = TrainingData<'programmes'>['weeks'][number]['activities'][number]
type Category = Activity['category']

export const planGoals: Record<PlanGoal, string> = {
  flexibility: 'Improve flexibility',
  'guard-mobility': 'Improve guard mobility',
  strength: 'Build strength',
  endurance: 'Build cardiovascular endurance',
  grip: 'Improve grip endurance',
  explosiveness: 'Develop explosiveness',
  recovery: 'Improve recovery',
  competition: 'Prepare for competition',
  fitness: 'Develop general fitness',
}

export interface PlanInput {
  weekStart: string
  timeZone: string
  belt: string
  bjjExperience: 'new' | 'regular' | 'experienced'
  strengthExperience: 'new' | 'regular' | 'experienced'
  weeklyMatSessions: number
  fixedDays: number[]
  restDays: number[]
  goal: PlanGoal
  availableMinutes: number
  equipment: string[]
  mobilityPriorities: string[]
  excludedExercises: string[]
  competitionDate?: string
  existing?: Pick<Activity, 'weekday' | 'category' | 'durationMinutes' | 'intensity'>[]
}

export interface PlanOption {
  slug?: string
  title: string
  category: Category
  durationMinutes: number
  intensity: Activity['intensity']
  exerciseSlugs: string[]
  equipment: string[]
  regions?: string[]
  difficulty?: 'beginner' | 'intermediate' | 'advanced'
}

const weeklyOrder = [0, 3, 5, 1, 4, 2, 6]
const defaults: Record<PlanGoal, Category[]> = {
  flexibility: ['mobility', 'strength', 'mobility'],
  'guard-mobility': ['mobility', 'solo', 'strength'],
  strength: ['strength', 'mobility', 'strength'],
  endurance: ['conditioning', 'mobility', 'strength'],
  grip: ['strength', 'mobility', 'strength'],
  explosiveness: ['strength', 'mobility', 'solo'],
  recovery: ['recovery', 'mobility', 'recovery'],
  competition: ['strength', 'mobility', 'solo'],
  fitness: ['strength', 'mobility', 'conditioning'],
}

export function shiftDate(date: string, days: number) {
  const utc = new Date(`${date}T12:00:00Z`)
  utc.setUTCDate(utc.getUTCDate() + days)
  return utc.toISOString().slice(0, 10)
}

export function isoWeekStart(date: string) {
  const utc = new Date(`${date}T12:00:00Z`)
  return shiftDate(date, -((utc.getUTCDay() + 6) % 7))
}

export function dateInZone(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    year: 'numeric', month: '2-digit', day: '2-digit', timeZone,
  }).formatToParts(date)
  const part = (type: string) => parts.find(item => item.type === type)?.value
  return `${part('year')}-${part('month')}-${part('day')}`
}

export function generateTrainingWeek(input: PlanInput, options: PlanOption[]): { activities: Activity[]; notices: string[] } {
  const activities: Activity[] = []
  const notices: string[] = []
  const rest = new Set(input.restDays)
  const fixed = [...new Set(input.fixedDays)]
  const existing = input.existing ?? []
  const matCategories: Category[] = ['bjj_gi', 'bjj_no_gi', 'open_mat', 'private_lesson']
  const existingMat = existing.filter(activity => matCategories.includes(activity.category))
  const existingMatDays = new Set(existingMat.map(activity => activity.weekday))
  const existingCompetition = existing.find(activity => activity.category === 'competition')
  const matDays = fixed.filter(day => !existingMatDays.has(day))
  const matMinutes = input.bjjExperience === 'new' ? 60 : 75
  const taper = Boolean(input.competitionDate && input.competitionDate >= input.weekStart && input.competitionDate <= shiftDate(input.weekStart, 13))
  const eventDay = input.competitionDate && Array.from({ length: 7 }, (_, day) => shiftDate(input.weekStart, day)).indexOf(input.competitionDate)
  if (typeof eventDay === 'number' && eventDay >= 0) {
    rest.delete(eventDay)
    const matchIndex = matDays.indexOf(eventDay)
    if (matchIndex >= 0) matDays.splice(matchIndex, 1)
    if (!existingCompetition || existingCompetition.weekday !== eventDay) {
      activities.push({ weekday: eventDay, title: 'Competition', category: 'competition', durationMinutes: 0, intensity: 'hard', rationale: 'Scheduled competition. Add your actual mat time after the event.' })
    }
  }
  for (const day of fixed) {
    if (rest.delete(day)) notices.push('A fixed BJJ session takes priority over a preferred rest day.')
  }
  for (const activity of existing) {
    if (activity.category === 'rest') rest.add(activity.weekday)
  }
  let remaining = input.availableMinutes - matDays.length * matMinutes - existing.reduce((sum, activity) => sum + activity.durationMinutes, 0)
  for (const day of weeklyOrder) {
    if (matDays.length + existingMat.length >= input.weeklyMatSessions || remaining < matMinutes) break
    if (rest.has(day) || matDays.includes(day) || day === eventDay || existing.some(activity => activity.weekday === day)) continue
    matDays.push(day)
    remaining -= matMinutes
  }
  if (existing.length) notices.push('Your existing calendar activities count toward this week’s training time.')
  if (matDays.length + existingMat.length < input.weeklyMatSessions) notices.push('The available time and rest days leave room for fewer mat sessions than requested.')
  if (remaining < 0) notices.push('Fixed mat sessions exceed the available time. Adjust the preview before confirming it.')
  for (const day of matDays) {
    activities.push({
      weekday: day, title: 'BJJ training', category: 'bjj_gi', durationMinutes: matMinutes,
      intensity: taper || input.bjjExperience === 'new' || input.belt === 'white' ? 'moderate' : 'hard',
      rationale: fixed.includes(day) ? 'Preserves your fixed mat schedule.' : 'Adds mat time toward your weekly BJJ target.',
    })
  }
  for (const day of [...rest].filter(day => !existing.some(activity => activity.weekday === day))) {
    activities.push({ weekday: day, title: 'Rest day', category: 'rest', durationMinutes: 0, intensity: 'easy', rationale: 'Keeps your preferred rest day clear.' })
  }

  const equipment = new Set(input.equipment.map(value => value.toLowerCase()))
  const exclusions = new Set(input.excludedExercises)
  const priorities = new Set(input.mobilityPriorities)
  const excluded = (item: PlanOption) => item.exerciseSlugs.some(slug => exclusions.has(slug))
  const equipped = (name: string) => hasRequiredEquipment(name, equipment)
  const used = new Set<string>()
  for (const category of defaults[input.goal]) {
    const eligible = options.filter(item =>
      item.category === category && !excluded(item) && item.equipment.every(equipped) &&
      item.durationMinutes <= remaining && (!taper || item.intensity === 'easy') &&
      (input.strengthExperience !== 'new' || item.difficulty !== 'advanced') &&
      (input.bjjExperience !== 'new' || category !== 'solo' || item.difficulty !== 'advanced')
    )
    const score = (item: PlanOption) =>
      (item.regions?.filter(region => priorities.has(region)).length ?? 0) * 4 +
      Number(!used.has(item.title)) * 2 +
      Number(input.goal === 'grip' && /grip/i.test(item.title)) * 5
    const choice = [...eligible].sort((a, b) => score(b) - score(a) || a.durationMinutes - b.durationMinutes)[0]
    if (!choice) continue
    const busy = [...activities, ...existing].filter(activity => activity.category !== 'rest')
    const day = weeklyOrder.find(day =>
      !rest.has(day) && day !== eventDay && !busy.some(activity =>
        activity.weekday === day && (choice.intensity !== 'easy' || !matCategories.includes(activity.category))
      ) && (choice.intensity === 'easy' || !busy.some(activity =>
        activity.intensity === 'hard' && Math.abs(day - activity.weekday) <= 1
      ))
    )
    if (day === undefined) continue
    activities.push({
      weekday: day, category, title: choice.title, durationMinutes: choice.durationMinutes, templateId: choice.slug,
      intensity: choice.intensity, rationale: taper
        ? 'Keeps preparation light during the run-up to competition.'
        : `Supports your goal to ${planGoals[input.goal].toLowerCase()} and fits your available time and equipment.`,
    })
    used.add(choice.title)
    remaining -= choice.durationMinutes
  }
  return { activities: activities.sort((a, b) => a.weekday - b.weekday), notices: [...new Set(notices)] }
}

export function scheduleWeek(activities: Activity[], weekStart: string, timeZone: string): TrainingData<'activities'>[] {
  return activities.map(activity => ({
    title: activity.title, category: activity.category, date: shiftDate(weekStart, activity.weekday),
    timeZone, durationMinutes: activity.durationMinutes, status: 'planned',
    templateSlug: activity.templateId,
    notes: activity.rationale,
  }))
}
