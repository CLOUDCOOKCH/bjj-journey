'use client'

import Link from 'next/link'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { CalendarDays, ChevronDown, Dumbbell, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { bodyRegions, equipmentChoices, exerciseCatalog, getCatalogExercise, hasRequiredEquipment, programmeCatalog, routineCatalog } from '@/lib/training/catalog'
import { trainingClient } from '@/lib/training/client'
import { activeExerciseExclusions } from '@/lib/training/performance'
import { dateInZone, generateTrainingWeek, isoWeekStart, planGoals, scheduleWeek, shiftDate, type PlanGoal, type PlanOption } from '@/lib/training/plan'
import { activityCategories, activityLabels, getOccurrences } from '@/lib/training/planner'
import { trainingSchemas, type TrainingData } from '@/lib/training/schemas'

type Programme = TrainingData<'programmes'>
type Activity = Programme['weeks'][number]['activities'][number]
const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const belts = ['white', 'blue', 'purple', 'brown', 'black']
const selectClass = 'mt-1 min-h-11 w-full rounded-md border border-muted-foreground/85 bg-background px-2 text-sm focus-visible:outline-2 focus-visible:outline-ring'
const equipment = equipmentChoices(exerciseCatalog.flatMap(exercise => exercise.equipment)).sort()

function findOptions(available: string[], excluded: string[]): PlanOption[] {
  const equipmentAvailable = (name: string) => hasRequiredEquipment(name, available)
  const details = (slugs: string[]) => {
    const exercises = slugs.flatMap(slug => getCatalogExercise(slug) ?? [])
    return {
      exerciseSlugs: slugs,
      equipment: [...new Set(exercises.flatMap(exercise => exercise.equipment))],
      regions: [...new Set(exercises.flatMap(exercise => exercise.bodyRegions))],
      difficulty: exercises.some(exercise => exercise.difficulty === 'advanced') ? 'advanced' as const : 'beginner' as const,
    }
  }
  return [
    ...routineCatalog.map(routine => ({
      ...details(routine.steps.map(step => step.exerciseSlug)),
      slug: routine.slug, title: routine.name, category: routine.category,
      durationMinutes: routine.durationMinutes,
      intensity: routine.style === 'interval' ? 'moderate' as const : 'easy' as const,
    })),
    ...programmeCatalog.flatMap(programme => programme.schedule.map(day => {
      const substitutions: Record<string, string> = {}
      const exercises = day.exercises.map((exercise, index) => {
        const chosen = [exercise.exerciseSlug, ...exercise.substitutions].find(slug => {
          const item = getCatalogExercise(slug)
          return item && !excluded.includes(slug) && item.equipment.every(equipmentAvailable)
        }) ?? exercise.exerciseSlug
        if (chosen !== exercise.exerciseSlug) substitutions[`${day.day}:${index}`] = chosen
        return chosen
      })
      return {
        ...details(exercises), slug: encodeProgramme(programme.slug, day.day, false, substitutions),
        title: day.name, category: 'strength' as const,
        durationMinutes: 30, difficulty: programme.difficulty, intensity: 'moderate' as const,
      }
    })),
  ]
}

function calendarKey(value: unknown) {
  const input = new TextEncoder().encode(JSON.stringify(value))
  return crypto.subtle.digest('SHA-256', input).then(bytes => {
    const id = [...new Uint8Array(bytes).slice(0, 16)].map(byte => byte.toString(16).padStart(2, '0')).join('')
    return `${id.slice(0, 8)}-${id.slice(8, 12)}-4${id.slice(13, 16)}-8${id.slice(17, 20)}-${id.slice(20)}`
  })
}

export function ProgrammeBuilder({ belt, userId }: { belt: string; userId: string }) {
  const queryClient = useQueryClient()
  const reducedMotion = useReducedMotion()
  const [weekStart, setWeekStart] = useState('')
  const [weeks, setWeeks] = useState<Programme['weeks']>([])
  const [name, setName] = useState('')
  const [notes, setNotes] = useState('')
  const [goal, setGoal] = useState<string>()
  const [reviewRequest, setReviewRequest] = useState(0)
  const reviewHeading = useRef<HTMLHeadingElement>(null)
  const [activeWeek, setActiveWeek] = useState(0)
  const [editing, setEditing] = useState<{ id: string; version: number }>()
  const [notices, setNotices] = useState<string[]>([])
  const [selected, setSelected] = useState('')
  const [deload, setDeload] = useState(true)
  const [substitutions, setSubstitutions] = useState<Record<string, string>>({})
  const programmes = useQuery({
    queryKey: ['training', 'programmes'],
    queryFn: ({ signal }) => trainingClient.list<Programme>('programmes', signal),
  })
  const preferences = useQuery({
    queryKey: ['training', 'preferences'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'preferences'>>('preferences', signal),
  })
  const discomfort = useQuery({
    queryKey: ['training', 'discomfort'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'discomfort'>>('discomfort', signal),
  })
  const competitions = useQuery({
    queryKey: ['training', 'competitions'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'competitions'>>('competitions', signal),
  })
  const calendar = useQuery({
    queryKey: ['training', 'activities'],
    queryFn: ({ signal }) => trainingClient.list<TrainingData<'activities'>>('activities', signal),
  })
  const zone = preferences.data?.find(item => item.data.key === 'training')?.data.timeZone ||
    Intl.DateTimeFormat().resolvedOptions().timeZone
  const today = dateInZone(new Date(), zone)
  const nextCompetition = competitions.data?.map(item => item.data.date).filter(date => date >= today).sort()[0]
  const start = weekStart ? isoWeekStart(weekStart) : isoWeekStart(today)
  const activities = weeks[activeWeek]?.activities ?? []
  const activityCount = weeks.reduce((count, week) => count + week.activities.length, 0)
  const programme = programmeCatalog.find(item => item.slug === selected)
  useEffect(() => {
    if (reviewRequest) reviewHeading.current?.focus()
  }, [reviewRequest])

  const save = useMutation({
    mutationFn: () => {
      const parsed = trainingSchemas.programmes.safeParse({ name, weeks, goal, notes })
      if (!parsed.success) throw new Error(parsed.error.issues[0]?.message ?? 'Review the programme fields.')
      const data = parsed.data
      return editing ? trainingClient.update('programmes', editing.id, editing.version, data) : trainingClient.create('programmes', data)
    },
    onSuccess: record => {
      setEditing({ id: record.id, version: record.version })
      queryClient.invalidateQueries({ queryKey: ['training', 'programmes'] })
    },
    onError: () => queryClient.invalidateQueries({ queryKey: ['training', 'programmes'] }),
  })
  const addToCalendar = useMutation({
    mutationFn: async () => {
      const planned = weeks.flatMap((week, index) => scheduleWeek(week.activities, shiftDate(start, index * 7), zone))
      const items = await Promise.all(planned.map(async (data, index) => {
        const parsed = trainingSchemas.activities.safeParse(data)
        if (!parsed.success) throw new Error(`Activity ${index + 1}: ${parsed.error.issues[0]?.message ?? 'Review the fields.'}`)
        return { id: await calendarKey({ userId, data, index }), data: parsed.data }
      }))
      return trainingClient.createBatch(items)
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['training', 'activities'] }),
  })
  const remove = useMutation({
    mutationFn: (record: { id: string; version: number }) => trainingClient.remove('programmes', record.id, record.version),
    onSuccess: (_, record) => {
      if (record.id === editing?.id) setEditing(undefined)
      queryClient.invalidateQueries({ queryKey: ['training', 'programmes'] })
    },
  })

  function buildPreview(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const text = (field: string) => String(data.get(field) ?? '')
    const items = (field: string) => data.getAll(field).map(String)
    const requestedGoal = text('goal') as PlanGoal
    const existing = getOccurrences(calendar.data ?? [], start, shiftDate(start, 6)).flatMap(item => {
      const activity = item.record.data
      if (activity.status === 'cancelled' || activity.status === 'skipped') return []
      const weekday = weekdays.findIndex((_, day) => shiftDate(start, day) === item.date)
      const intensity = ['bjj_gi', 'bjj_no_gi', 'open_mat', 'competition'].includes(activity.category) ? 'hard' as const : 'moderate' as const
      return [{ weekday, category: activity.category, durationMinutes: activity.durationMinutes, intensity }]
    })
    const excluded = [...items('avoid'), ...activeExerciseExclusions(discomfort.data?.map(item => item.data) ?? [])]
    const available = items('equipment')
    const result = generateTrainingWeek({
      weekStart: start, timeZone: zone, belt: text('belt'), goal: requestedGoal,
      bjjExperience: text('bjjExperience') as 'new' | 'regular' | 'experienced',
      strengthExperience: text('strengthExperience') as 'new' | 'regular' | 'experienced',
      weeklyMatSessions: Number(text('frequency')), availableMinutes: Number(text('minutes')),
      fixedDays: items('fixedDays').map(Number), restDays: items('restDays').map(Number),
      equipment: available, mobilityPriorities: items('mobilityPriority'),
      excludedExercises: excluded, competitionDate: text('competitionDate') || nextCompetition, existing,
    }, findOptions(available, excluded))
    load({ name: planGoals[requestedGoal], goal: planGoals[requestedGoal], weeks: [{ activities: result.activities }] })
    setNotices(result.notices)
  }

  function load(data: Programme, record?: { id: string; version: number }) {
    setWeeks(data.weeks)
    setName(data.name)
    setGoal(data.goal)
    setNotes(data.notes ?? '')
    setActiveWeek(0)
    setEditing(record)
    setNotices([])
    setReviewRequest(request => request + 1)
    save.reset()
    addToCalendar.reset()
  }

  function fromTemplate() {
    if (!programme) return
    load({
      name: programme.name, notes: programme.description,
      weeks: Array.from({ length: programme.weeks }, (_, index) => ({
        activities: programme.schedule.map(day => {
          const lighter = deload && index + 1 === programme.optionalDeloadWeek
          return {
            weekday: day.day - 1, title: day.name, category: 'strength', durationMinutes: lighter ? 20 : 30,
            intensity: lighter ? 'easy' : 'moderate',
            templateId: encodeProgramme(programme.slug, day.day, lighter, substitutions),
            rationale: lighter ? 'Deload week with fewer working sets.' : 'Strength work to complement mat sessions.',
          }
        }),
      })),
    })
  }

  function modifyActivities(update: (value: Activity[]) => Activity[]) {
    setWeeks(current => current.map((week, index) => index === activeWeek ? { activities: update(week.activities) } : week))
    save.reset()
    addToCalendar.reset()
  }

  return (
    <div className="grid min-w-0 items-start gap-8 [&_input:not([type=checkbox])]:min-h-11 [&_input:not([type=checkbox])]:border-muted-foreground/85 [&_textarea]:border-muted-foreground/85 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
      <div className="space-y-8">
        <nav className="flex flex-wrap gap-2 xl:hidden" aria-label="Programme sections">
          <Button asChild variant="outline"><a href="#strength-templates">Strength templates</a></Button>
          <Button asChild variant="outline"><a href="#saved-programmes">Saved programmes</a></Button>
        </nav>
        <section aria-labelledby="generate-plan">
          <h2 id="generate-plan" className="text-xl font-semibold">Generate a week</h2>
          <form onSubmit={buildPreview} className="mt-4 space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-sm font-medium">Primary goal
                <select className={selectClass} name="goal" defaultValue="fitness">{Object.entries(planGoals).map(([id, title]) => <option key={id} value={id}>{title}</option>)}</select>
              </label>
              <label className="text-sm font-medium">Week starting Monday
                <Input className="mt-1" type="date" min={isoWeekStart(today)} value={start} onChange={event => {
                  const date = event.target.value
                  setWeekStart(date && isoWeekStart(date))
                }} required />
              </label>
              <label className="text-sm font-medium">Belt
                <select className={selectClass + ' capitalize'} name="belt" defaultValue={belt}>{belts.map(item => <option key={item} value={item}>{item}</option>)}</select>
              </label>
              <label className="text-sm font-medium">Weekly mat sessions
                <Input className="mt-1" name="frequency" type="number" min={0} max={7} defaultValue={3} required />
              </label>
              <ExperienceField label="BJJ experience" name="bjjExperience" />
              <ExperienceField label="Strength experience" name="strengthExperience" />
              <label className="text-sm font-medium">Available training minutes per week
                <Input className="mt-1" name="minutes" type="number" min={0} max={2400} defaultValue={300} required />
              </label>
              <label className="text-sm font-medium">Upcoming competition (optional)
                <Input className="mt-1" name="competitionDate" type="date" min={today} defaultValue={nextCompetition} />
              </label>
            </div>
            <DaySelector title="Fixed BJJ days" name="fixedDays" />
            <DaySelector title="Preferred rest days" name="restDays" />
            <details className="rounded-xl border bg-card">
              <summary className="cursor-pointer px-4 py-3 text-sm font-medium">Equipment, mobility priorities and exercises to avoid</summary>
              <div className="grid gap-4 border-t px-4 py-4 sm:grid-cols-3">
                <label className="text-sm font-medium">Equipment
                  <select className={selectClass + ' h-36 py-2'} name="equipment" multiple>
                    {equipment.map(item => <option key={item}>{item}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Mobility priorities
                  <select className={selectClass + ' h-36 py-2 capitalize'} name="mobilityPriority" multiple>
                    {bodyRegions.map(item => <option key={item} value={item}>{item.replaceAll('-', ' ')}</option>)}
                  </select>
                </label>
                <label className="text-sm font-medium">Exercises to avoid
                  <select className={selectClass + ' h-36 py-2'} name="avoid" multiple>
                    {exerciseCatalog.map(item => <option key={item.slug} value={item.slug}>{item.name}</option>)}
                  </select>
                </label>
              </div>
            </details>
            {(discomfort.isPending || calendar.isPending) && <p role="status" className="text-sm text-muted-foreground">Loading calendar activities and exercise exclusions…</p>}
            {(discomfort.isError || calendar.isError) && <div className="flex flex-wrap items-center gap-2">
              <p role="alert" className="text-sm text-destructive">Calendar activities or exercise exclusions could not be loaded.</p>
              <Button variant="outline" type="button" onClick={() => { void discomfort.refetch(); void calendar.refetch() }}>Retry</Button>
            </div>}
            <Button type="submit" disabled={!discomfort.isSuccess || !calendar.isSuccess}>Generate preview</Button>
          </form>
        </section>
        {weeks.length > 0 && (
          <motion.section initial={reducedMotion ? false : { opacity: 0.85, y: 4 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.18 }}
            aria-labelledby="review-plan" className="space-y-4 border-t pt-6">
            <h2 id="review-plan" ref={reviewHeading} tabIndex={-1} className="scroll-mt-24 text-xl font-semibold focus-visible:outline-2 focus-visible:outline-ring">Review your plan</h2>
            {notices.map(message => <p key={message} className="text-sm text-muted-foreground" role="status">{message}</p>)}
            <label className="block text-sm font-medium">Plan name
              <Input className="mt-1" value={name} onChange={event => setName(event.target.value)} maxLength={200} />
            </label>
            <label className="block max-w-52 text-sm font-medium">Schedule from Monday
              <Input className="mt-1" type="date" min={isoWeekStart(today)} value={start} onChange={event => {
                const date = event.target.value
                setWeekStart(date && isoWeekStart(date))
              }} />
            </label>
            <div className="flex flex-wrap items-center gap-2">
              {weeks.map((_, index) => <Button key={index} type="button" variant={activeWeek === index ? 'default' : 'outline'} aria-pressed={activeWeek === index} onClick={() => setActiveWeek(index)}>Week {index + 1}</Button>)}
              {weeks.length < 12 && <Button type="button" variant="outline" onClick={() => {
                setWeeks(current => [...current, { activities }])
                setActiveWeek(weeks.length)
              }}><Plus /> Copy week</Button>}
              {weeks.length > 1 && <Button type="button" variant="ghost" onClick={() => {
                setWeeks(current => current.filter((_, index) => index !== activeWeek))
                setActiveWeek(Math.max(0, activeWeek - 1))
              }}>Remove week</Button>}
            </div>
            <div className="divide-y rounded-xl border bg-card">
              {activities.map((activity, index) => (
                <ActivityEditor key={index} activity={activity} update={patch => modifyActivities(items => items.map((item, itemIndex) => itemIndex === index ? { ...item, ...patch } : item))}
                  remove={() => modifyActivities(items => items.filter((_, itemIndex) => itemIndex !== index))} />
              ))}
              <Button className="m-2" variant="ghost" disabled={activities.length >= 35} onClick={() => modifyActivities(items => [...items, {
                title: 'Mobility', category: 'mobility', weekday: 0, durationMinutes: 10, intensity: 'easy',
              }])}><Plus /> Add activity</Button>
            </div>
            <label className="block text-sm font-medium">Plan notes
              <Textarea className="mt-1" value={notes} onChange={event => setNotes(event.target.value)} maxLength={4000} />
            </label>
            {(save.error || addToCalendar.error) && <p role="alert" className="text-sm text-destructive">{(save.error || addToCalendar.error)?.message}</p>}
            {activityCount > 100 && <p className="text-sm text-muted-foreground">Schedule up to 100 activities at a time. Remove some weeks before confirming this plan.</p>}
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="outline" disabled={!name.trim() || save.isPending} onClick={() => save.mutate()}>{save.isPending ? 'Saving…' : 'Save programme'}</Button>
              <Button type="button" disabled={addToCalendar.isPending || activityCount < 1 || activityCount > 100} onClick={() => addToCalendar.mutate()}>
                <CalendarDays /> {addToCalendar.isPending ? 'Scheduling…' : 'Confirm and add to calendar'}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">Edit already scheduled activities in the calendar.</p>
            {save.isSuccess && <p role="status" className="text-sm">Programme saved.</p>}
            {addToCalendar.isSuccess && <p role="status" className="text-sm"><Link className="underline underline-offset-4" href="/calendar">Open your calendar</Link> to see the scheduled plan.</p>}
          </motion.section>
        )}
      </div>
      <aside className="space-y-6">
        <section aria-labelledby="strength-templates" className="rounded-xl border bg-card p-4 sm:p-5">
          <h2 id="strength-templates" className="flex scroll-mt-24 items-center gap-2 text-lg font-semibold"><Dumbbell size={19} aria-hidden="true" /> BJJ strength templates</h2>
          <div className="mt-3 divide-y">
            {programmeCatalog.map(template => (
              <div key={template.slug}>
                <button type="button" onClick={() => {
                  setSelected(selected === template.slug ? '' : template.slug)
                  setSubstitutions({})
                }} aria-controls={selected === template.slug ? `programme-${template.slug}` : undefined}
                  aria-expanded={selected === template.slug}
                  className="flex min-h-12 w-full items-center justify-between gap-3 text-left text-sm font-medium hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
                  {template.name} <ChevronDown className={selected === template.slug ? 'rotate-180' : undefined} size={17} aria-hidden="true" />
                </button>
                {programme?.slug === template.slug && (
                  <div id={`programme-${template.slug}`} className="space-y-3 pb-4 pt-1">
                    <p className="text-sm text-muted-foreground">{programme.description}</p>
                    <label className="flex min-h-10 items-center gap-2 text-sm"><input type="checkbox" checked={deload} onChange={event => setDeload(event.target.checked)} /> Include optional deload in week {programme.optionalDeloadWeek}</label>
                    {programme.schedule.map(day => (
                      <details key={day.day} className="rounded-md border px-3 py-2">
                        <summary className="cursor-pointer text-sm font-medium">{day.name}</summary>
                        {day.exercises.map((exercise, index) => {
                          const id = `${day.day}:${index}`
                          return (
                            <label key={id} className="mt-3 block text-sm">{getCatalogExercise(exercise.exerciseSlug)?.name ?? exercise.exerciseSlug}
                              <select className={selectClass} value={substitutions[id] ?? exercise.exerciseSlug}
                                onChange={event => setSubstitutions(old => ({ ...old, [id]: event.target.value }))}>
                                {[exercise.exerciseSlug, ...exercise.substitutions].map(slug => <option key={slug} value={slug}>{getCatalogExercise(slug)?.name ?? slug}</option>)}
                              </select>
                            </label>
                          )
                        })}
                      </details>
                    ))}
                    <Button type="button" variant="outline" onClick={fromTemplate}>Use this programme</Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
        <section aria-labelledby="saved-programmes">
          <h2 id="saved-programmes" className="scroll-mt-24 text-lg font-semibold">Saved programmes</h2>
          {programmes.isPending && <p role="status" className="mt-2 text-sm">Loading programmes…</p>}
          {programmes.isError && <p role="alert" className="mt-2 text-sm text-destructive">{programmes.error.message}</p>}
          {programmes.data?.length === 0 && <p className="mt-2 text-sm text-muted-foreground">Save a plan to use it again later.</p>}
          <ul className="mt-2 divide-y">
            {programmes.data?.map(record => (
              <li key={record.id} className="flex min-w-0 items-center justify-between gap-2">
                <Button className="min-h-11 min-w-0 flex-1 justify-start text-left" variant="ghost" onClick={() => load(record.data, record)}><span className="truncate">{record.data.name}</span></Button>
                <Button variant="ghost" size="icon" aria-label={`Delete ${record.data.name}`} disabled={remove.isPending} onClick={() => {
                  if (window.confirm(`Delete “${record.data.name}”?`)) remove.mutate(record)
                }}><Trash2 /></Button>
              </li>
            ))}
          </ul>
          {remove.error && <p role="alert" className="mt-2 text-sm text-destructive">{remove.error.message}</p>}
        </section>
      </aside>
    </div>
  )
}

function encodeProgramme(slug: string, day: number, deload: boolean, substitutions: Record<string, string>) {
  const choices = Object.entries(substitutions)
    .filter(([id]) => id.startsWith(`${day}:`))
    .map(([id, exercise]) => `${id.split(':')[1]}=${exercise}`)
    .join(',')
  return [`programme:${slug}:${day}`, deload ? 'deload' : '', choices].join(':').replace(/:+$/, '')
}

function ExperienceField({ label, name }: { label: string; name: string }) {
  return (
    <label className="text-sm font-medium">{label}
      <select className={selectClass} name={name} defaultValue="regular">
        <option value="new">Getting started</option><option value="regular">Train regularly</option><option value="experienced">Experienced</option>
      </select>
    </label>
  )
}

function DaySelector({ title, name }: { title: string; name: string }) {
  return (
    <fieldset>
      <legend className="mb-1 text-sm font-medium">{title}</legend>
      <div className="flex flex-wrap gap-x-4 gap-y-1">
        {weekdays.map((day, index) => <label className="flex min-h-10 items-center gap-1.5 text-sm" key={day}><input type="checkbox" name={name} value={index} /> {day}</label>)}
      </div>
    </fieldset>
  )
}

function ActivityEditor({ activity, update, remove }: { activity: Activity; update: (patch: Partial<Activity>) => void; remove: () => void }) {
  return (
    <div className="space-y-2 p-3 sm:p-4">
      <div className="grid grid-cols-2 items-end gap-2 sm:grid-cols-[minmax(0,1fr)_6rem_9rem_6rem_auto]">
        <label className="col-span-full min-w-0 text-xs font-medium sm:col-span-1">Activity
          <Input className="mt-1" value={activity.title} maxLength={200} onChange={event => update({ title: event.target.value })} />
        </label>
        <label className="text-xs font-medium">Day
          <select className={selectClass} value={activity.weekday} onChange={event => update({ weekday: Number(event.target.value) })}>
            {weekdays.map((day, index) => <option key={day} value={index}>{day}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium">Type
          <select className={selectClass} value={activity.category} onChange={event => update({ category: event.target.value as Activity['category'], templateId: undefined })}>
            {activityCategories.map(category => <option key={category} value={category}>{activityLabels[category]}</option>)}
          </select>
        </label>
        <label className="text-xs font-medium">Minutes
          <Input className="mt-1" type="number" min={0} max={1440} value={activity.durationMinutes} onChange={event => update({ durationMinutes: Number(event.target.value) })} />
        </label>
        <Button type="button" variant="ghost" size="icon" aria-label={`Remove ${activity.title || 'activity'}`} onClick={remove}><Trash2 /></Button>
      </div>
      {activity.rationale && <p className="text-sm text-muted-foreground">{activity.rationale}</p>}
    </div>
  )
}
