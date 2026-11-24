import {
  activityLaunchUrl, addCalendarDays, calendarDays, dateInZone, firstDayOfWeek, getDueReminders,
  getOccurrences, getUpcomingReminders, isCalendarDate, matSessionStreak, scheduledInstant, type PlannedActivity, type TrainingRecord,
} from './planner'

function record(id: string, overrides: Partial<PlannedActivity> = {}): TrainingRecord<PlannedActivity> {
  return {
    id, version: 1, createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-01T00:00:00Z',
    data: {
      title: 'Evening Gi', category: 'bjj_gi', date: '2026-03-16', time: '18:30', timeZone: 'Europe/Zurich',
      durationMinutes: 90, status: 'planned', ...overrides,
    },
  }
}

test('validates dates strictly and enumerates a Monday-first week across month boundaries', () => {
  expect(isCalendarDate('2026-02-31')).toBe(false)
  expect(isCalendarDate('2024-02-29')).toBe(true)
  expect(firstDayOfWeek('2026-11-01')).toBe('2026-10-26')
  expect(calendarDays('2026-10-30', '2026-11-01')).toEqual(['2026-10-30', '2026-10-31', '2026-11-01'])
  expect(addCalendarDays('2026-12-31', 1)).toBe('2027-01-01')
  expect(dateInZone(new Date('2026-11-24T01:00:00Z'), 'America/Los_Angeles')).toBe('2026-11-23')
})

test('recurrence preserves local start time through daylight-saving changes', () => {
  const series = record('series', { repeat: { intervalWeeks: 1, until: '2026-04-06' } })
  const occurrences = getOccurrences([series], '2026-03-23', '2026-04-30')
  expect(occurrences.map(({ date }) => date)).toEqual(['2026-03-23', '2026-03-30', '2026-04-06'])
  expect(occurrences.map(({ date }) => scheduledInstant(date, '18:30', 'Europe/Zurich').toISOString())).toEqual([
    '2026-03-23T17:30:00.000Z', '2026-03-30T16:30:00.000Z', '2026-04-06T16:30:00.000Z',
  ])
})

test('DST overlaps use the earlier instant and clock gaps preserve the minute after the jump', () => {
  expect(scheduledInstant('2026-10-25', '02:30', 'Europe/Zurich').toISOString()).toBe('2026-10-25T00:30:00.000Z')
  expect(scheduledInstant('2026-03-29', '02:30', 'Europe/Zurich').toISOString()).toBe('2026-03-29T01:30:00.000Z')
})

test('rescheduled and skipped occurrences suppress the originals and keep separate activity IDs', () => {
  const series = record('series', { repeat: { intervalWeeks: 1, exceptions: ['2026-03-23'] } })
  const moved = record('moved', { date: '2026-04-01', seriesId: series.id, occurrenceDate: '2026-03-30' })
  const skipped = record('skipped', { date: '2026-04-06', seriesId: series.id, occurrenceDate: '2026-04-06', status: 'skipped' })
  const independent = record('another', { date: '2026-04-01', time: '06:30' })
  const days = getOccurrences([series, moved, skipped, independent], '2026-03-23', '2026-04-06')
  expect(days.map(({ date, virtual, record: { id } }) => [date, virtual, id])).toEqual([
    ['2026-04-01', false, 'another'], ['2026-04-01', false, 'moved'], ['2026-04-06', false, 'skipped'],
  ])
})

test('reminders respect the activity time zone and never repeat for completed or cancelled records', () => {
  const session = record('tonight', { date: '2026-03-30', reminderMinutes: 30 })
  const cancelled = record('cancelled', { date: '2026-03-30', reminderMinutes: 30, status: 'cancelled' })
  expect(getDueReminders([session, cancelled], new Date('2026-03-30T16:01:00Z'), 'America/New_York').map(({ record }) => record.id)).toEqual(['tonight'])
  expect(getDueReminders([session], new Date('2026-03-30T16:31:00Z'), 'America/New_York')).toEqual([])
  expect(getUpcomingReminders([session], new Date('2026-03-30T15:45:00Z'), 'America/New_York')[0].reminder)
    .toBe(Date.parse('2026-03-30T16:00:00Z'))
})

test('launch routes keep the planned activity linked for a workout or a mat session', () => {
  const activity = record('strength-id', { category: 'strength', templateSlug: 'programme:two-day:2:deload:1=pull-up' })
  const url = new URL(activityLaunchUrl(activity), 'https://example.test')
  expect(url.pathname).toBe('/training/strength')
  expect(Object.fromEntries(url.searchParams)).toEqual({
    activityId: 'strength-id', programme: 'two-day', day: '2', deload: '1', substitutions: '1=pull-up',
  })
  expect(activityLaunchUrl(record('gi-id'))).toBe('/start-training?activityId=gi-id&date=2026-03-16')
})

test('mat streaks count unique training days, pause for planned rest and ignore future records', () => {
  const rest = record('rest', { date: '2026-11-23', category: 'rest', durationMinutes: 0 })
  const dates = ['2026-11-21', '2026-11-22', '2026-11-22', '2026-11-25']
  expect(matSessionStreak(dates, [rest], '2026-11-24')).toBe(2)
  expect(matSessionStreak(dates, [record('skipped', { ...rest.data, status: 'skipped' })], '2026-11-24')).toBe(0)
})
