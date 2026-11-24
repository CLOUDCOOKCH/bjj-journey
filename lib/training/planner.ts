import type { TrainingRecord } from './client'
import type { TrainingData } from './schemas'

export type { TrainingRecord } from './client'

export const activityLabels = {
  bjj_gi: 'BJJ Gi',
  bjj_no_gi: 'BJJ No-Gi',
  open_mat: 'Open Mat',
  strength: 'Strength',
  mobility: 'Mobility',
  conditioning: 'Conditioning',
  solo: 'Solo Drills',
  recovery: 'Recovery',
  rest: 'Rest Day',
  competition: 'Competition',
  private_lesson: 'Private Lesson',
} as const

export type ActivityCategory = keyof typeof activityLabels
export type ActivityStatus = 'planned' | 'in_progress' | 'completed' | 'skipped' | 'cancelled'

export type PlannedActivity = TrainingData<'activities'>

export interface ActivityOccurrence {
  record: TrainingRecord<PlannedActivity>
  date: string
  virtual: boolean
}

export const activityCategories = Object.keys(activityLabels) as ActivityCategory[]

export const activityStatusLabels: Record<ActivityStatus, string> = {
  planned: 'Planned',
  in_progress: 'In progress',
  completed: 'Completed',
  skipped: 'Skipped',
  cancelled: 'Cancelled',
}

const dayMilliseconds = 86_400_000

export function getDeviceTimeZone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'
}

export function dateInZone(instant: Date, timeZone: string) {
  const formatter = new Intl.DateTimeFormat('en', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' })
  const part = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]))
  return `${part.year}-${part.month}-${part.day}`
}

export function isCalendarDate(value: string | null): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const isoDate = new Date(`${value}T00:00:00Z`)
  return Number.isFinite(isoDate.getTime()) && isoDate.toISOString().slice(0, 10) === value
}

export function calendarDate(date: string) {
  return new Date(`${date}T12:00:00Z`)
}

export function addCalendarDays(date: string, days: number) {
  return new Date(calendarDate(date).getTime() + days * dayMilliseconds).toISOString().slice(0, 10)
}

export function addCalendarMonths(date: string, months: number) {
  const instant = calendarDate(date)
  instant.setUTCDate(1)
  instant.setUTCMonth(instant.getUTCMonth() + months)
  return instant.toISOString().slice(0, 10)
}

export function firstDayOfWeek(date: string) {
  const offset = (calendarDate(date).getUTCDay() + 6) % 7
  return addCalendarDays(date, -offset)
}

export function formatCalendarDate(date: string, options: Intl.DateTimeFormatOptions) {
  return new Intl.DateTimeFormat(undefined, { ...options, timeZone: 'UTC' }).format(calendarDate(date))
}

export function calendarDays(first: string, last: string) {
  const size = Math.round((calendarDate(last).getTime() - calendarDate(first).getTime()) / dayMilliseconds) + 1
  return Array.from({ length: Math.max(size, 0) }, (_, index) => addCalendarDays(first, index))
}

function localTimePart(instant: Date, formatter: Intl.DateTimeFormat) {
  const part = Object.fromEntries(formatter.formatToParts(instant).map(({ type, value }) => [type, value]))
  return Date.parse(`${part.year}-${part.month}-${part.day}T${part.hour}:${part.minute}:00Z`)
}

// Resolve a fall-back overlap to the earlier instant and a spring-forward gap to the later offset.
export function scheduledInstant(date: string, time: string, timeZone: string) {
  const local = Date.parse(`${date}T${time}:00Z`)
  const formatter = new Intl.DateTimeFormat('en', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  })
  const candidates = [local - dayMilliseconds, local, local + dayMilliseconds].map((instant) => {
    const offset = localTimePart(new Date(instant), formatter) - instant
    return local - offset
  })
  const matches = candidates.filter((instant) => localTimePart(new Date(instant), formatter) === local)
  return new Date(matches.length ? Math.min(...matches) : Math.max(...candidates))
}

export function getOccurrences(records: TrainingRecord<PlannedActivity>[], start: string, end: string) {
  const overrides = new Set(records
    .filter(({ data }) => data.seriesId)
    .map(({ data }) => `${data.seriesId}:${data.occurrenceDate}`))
  const occurrences: ActivityOccurrence[] = []

  for (const record of records) {
    const { data } = record
    if (!data.repeat) {
      if (data.date >= start && data.date <= end && !overrides.has(`${record.id}:${data.date}`)) {
        occurrences.push({ record, date: data.date, virtual: false })
      }
      continue
    }

    if (data.status !== 'planned' || data.date > end) continue
    const intervalDays = data.repeat.intervalWeeks * 7
    if (intervalDays <= 0) continue
    const daysToStart = (calendarDate(start).getTime() - calendarDate(data.date).getTime()) / dayMilliseconds
    const firstIndex = Math.max(0, Math.ceil(daysToStart / intervalDays))
    for (let date = addCalendarDays(data.date, firstIndex * intervalDays);
      date <= end && (!data.repeat.until || date <= data.repeat.until);
      date = addCalendarDays(date, intervalDays)) {
      if (!overrides.has(`${record.id}:${date}`) && !data.repeat.exceptions?.includes(date)) {
        occurrences.push({ record, date, virtual: true })
      }
    }
  }

  return occurrences.sort((a, b) =>
    a.date.localeCompare(b.date) ||
    (a.record.data.time || '').localeCompare(b.record.data.time || '') ||
    a.record.data.title.localeCompare(b.record.data.title),
  )
}

export function matSessionStreak(dates: string[], records: TrainingRecord<PlannedActivity>[], today: string) {
  const completed = new Set(dates.filter((date) => date <= today))
  if (!completed.size) return 0

  const oldest = [...completed].sort()[0]
  const allowedRest = new Set(getOccurrences(records, oldest, today)
    .filter(({ record }) => record.data.category === 'rest' && (record.data.status === 'planned' || record.data.status === 'completed'))
    .map(({ date }) => date))
  let days = 0
  const start = completed.has(today) ? today : addCalendarDays(today, -1)
  for (let date = start; date >= oldest; date = addCalendarDays(date, -1)) {
    if (completed.has(date)) days++
    else if (!allowedRest.has(date)) break
  }
  return days
}

export function getDueReminders(records: TrainingRecord<PlannedActivity>[], now: Date, timeZone: string) {
  const date = dateInZone(now, timeZone)
  return getOccurrences(records, addCalendarDays(date, -1), addCalendarDays(date, 2))
    .filter(({ record, date }) => {
      const { data } = record
      if (data.status !== 'planned' || !data.time || data.reminderMinutes === undefined) return false
      const starts = scheduledInstant(date, data.time, data.timeZone).getTime()
      return now.getTime() >= starts - data.reminderMinutes * 60_000 && now.getTime() <= starts
    })
}

export function getUpcomingReminders(records: TrainingRecord<PlannedActivity>[], now: Date, timeZone: string) {
  const date = dateInZone(now, timeZone)
  const nowTime = now.getTime()
  return getOccurrences(records, addCalendarDays(date, -1), addCalendarDays(date, 8))
    .flatMap((occurrence) => {
      const { data } = occurrence.record
      if (data.status !== 'planned' || !data.time || data.reminderMinutes === undefined) return []
      const reminder = scheduledInstant(occurrence.date, data.time, data.timeZone).getTime() - data.reminderMinutes * 60_000
      return reminder > nowTime && reminder <= nowTime + dayMilliseconds * 7 ? [{ ...occurrence, reminder }] : []
    })
    .sort((a, b) => a.reminder - b.reminder)
}

export function journalCategory(sessionType: string): ActivityCategory {
  switch (sessionType) {
    case 'no_gi': return 'bjj_no_gi'
    case 'open_mat': return 'open_mat'
    case 'competition': return 'competition'
    default: return 'bjj_gi'
  }
}

export function journalSessionLabel(sessionType: string) {
  if (sessionType === 'regular') return 'Mat session'
  if (sessionType === 'drilling') return 'Drilling'
  return activityLabels[journalCategory(sessionType)]
}

export function isWorkoutCategory(category: ActivityCategory) {
  return category === 'strength' || category === 'mobility' || category === 'conditioning' || category === 'solo' || category === 'recovery'
}

export function activityLaunchUrl(record: TrainingRecord<PlannedActivity>) {
  const { id, data } = record
  if (isWorkoutCategory(data.category)) {
    const query = new URLSearchParams({ activityId: id })
    if (data.templateSlug?.startsWith('programme:')) {
      const [, programme, day, deload, substitutions] = data.templateSlug.split(':')
      if (programme && day) {
        query.set('programme', programme)
        query.set('day', day)
        if (deload === 'deload') query.set('deload', '1')
        if (substitutions) query.set('substitutions', substitutions)
      }
    } else if (data.templateSlug) query.set('template', data.templateSlug)
    if (data.workoutTemplateId) query.set('templateId', data.workoutTemplateId)
    return `/training/${data.category}?${query}`
  }
  const query = new URLSearchParams({ activityId: id, date: data.date })
  return `/start-training?${query}`
}
