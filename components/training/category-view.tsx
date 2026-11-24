'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { CalendarPlus, ChevronRight, Heart } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { dateInZone, firstDayOfWeek, getDeviceTimeZone } from '@/lib/training/planner'
import { exerciseCatalog, getCatalogExercise, programmeCatalog, routineCatalog } from '@/lib/training/catalog'
import type { TrainingCategory } from '@/lib/training/catalog/types'
import { trainingClient, type TrainingRecord } from '@/lib/training/client'
import {
  blankTemplate,
  createWorkout,
  exerciseStep,
  programmeTemplate,
  routineTemplate,
  type WeightUnit,
  type WorkoutSession,
  type WorkoutTemplate,
} from '@/lib/training/workouts'
import { ExerciseLibrary, type ExerciseInput, type LibraryExercise } from './exercise-library'
import { IntervalBuilder, TemplateBuilder } from './template-builder'

interface Props {
  category: TrainingCategory
  userId: string
  plannedActivityId?: string
  initialTemplateSlug?: string
  initialTemplateId?: string
  programmeSlug?: string
  programmeDay: number
  deload: boolean
  substitutions?: string
}

function scheduleHref(category: TrainingCategory, slug?: string, id?: string) {
  const search = new URLSearchParams({ category })
  if (slug) search.set('template', slug)
  if (id) search.set('templateId', id)
  return `/calendar?${search}`
}

export function TrainingCategoryView({ category, userId, plannedActivityId, initialTemplateSlug, initialTemplateId, programmeSlug, programmeDay, deload, substitutions }: Props) {
  const router = useRouter()
  const queryClient = useQueryClient()
  const builderAlert = useRef<HTMLParagraphElement>(null)
  const startId = useRef<string | undefined>(undefined)
  const submitLock = useRef(false)
  const [edited, setEdited] = useState<WorkoutTemplate | undefined>()
  const [savedId, setSavedId] = useState<string | null>(initialTemplateId ?? null)
  const [selectedSlug, setSelectedSlug] = useState<string | undefined>(initialTemplateSlug)
  const [busy, setBusy] = useState(false)
  const [favouriteBusy, setFavouriteBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  const templateQuery = useQuery({ queryKey: ['training', 'templates', 'library', userId], queryFn: () => trainingClient.list<WorkoutTemplate>('templates') })
  const historyQuery = useQuery({ queryKey: ['training', 'workouts', 'library', userId], queryFn: () => trainingClient.list<WorkoutSession>('workouts') })
  const customQuery = useQuery({ queryKey: ['training', 'exercises', 'library', userId], queryFn: () => trainingClient.list<ExerciseInput>('exercises') })
  const favouritesQuery = useQuery({ queryKey: ['training', 'exercise_favourites', 'library', userId], queryFn: () => trainingClient.list<{ exerciseSlug: string }>('exercise_favourites') })
  const unitsQuery = useQuery({ queryKey: ['training', 'preferences', 'library', userId], queryFn: () => trainingClient.list<{ key: string; weightUnit?: WeightUnit; timeZone?: string }>('preferences') })
  const activityQuery = useQuery({
    queryKey: ['training', 'activities', 'library', userId, plannedActivityId],
    queryFn: () => trainingClient.get<{ title: string; category: string }>('activities', plannedActivityId ?? ''),
    enabled: Boolean(plannedActivityId),
  })
  const preferences = unitsQuery.data?.find(record => record.data.key === 'training')?.data
  const legacyUnits = unitsQuery.data?.find(record => record.data.key === 'units')?.data
  const unit = preferences?.weightUnit ?? legacyUnits?.weightUnit ?? 'kg'

  const customTemplates = (templateQuery.data ?? []).filter(record => record.data.category === category)
  const history = (historyQuery.data ?? []).filter(record => record.data.category === category)
  const plannedWorkout = plannedActivityId ? history.find(record => record.data.plannedActivityId === plannedActivityId) : undefined
  const programmes = programmeCatalog.find(item => item.slug === programmeSlug)
  const programme = useMemo(() => {
    if (category !== 'strength' || !programmes) return undefined
    const alternatives = new Map((substitutions ?? '').split(',').flatMap(item => {
      const [index, slug] = item.split('=')
      return slug && /^\d+$/.test(index) ? [[Number(index), slug] as const] : []
    }))
    return programmeTemplate(programmes, programmeDay, getCatalogExercise, { deload, substitutions: alternatives })
  }, [category, programmes, programmeDay, deload, substitutions])
  const routines = routineCatalog.filter(item => item.category === category)
  const sourceRoutine = routines.find(item => item.slug === selectedSlug)
  const sourceRecord = customTemplates.find(record => record.id === savedId)
  const builtInTemplate = useMemo(() => sourceRoutine ? routineTemplate(sourceRoutine, getCatalogExercise) : undefined, [sourceRoutine])
  const template = edited ?? sourceRecord?.data ?? builtInTemplate ?? programme ?? { ...blankTemplate(category), title: activityQuery.data?.data.title ?? '' }
  const exercises: LibraryExercise[] = [
    ...exerciseCatalog.filter(exercise => exercise.category === category),
    ...(customQuery.data ?? []).filter(record => record.data.category === category).map(record => ({
      ...record.data, slug: record.id,
      commonMistakes: record.data.commonMistakes ?? [],
      variations: record.data.variations ?? { easier: '', harder: '' },
    })),
  ]
  const favouriteIds = new Set((favouritesQuery.data ?? []).map(record => record.data.exerciseSlug))

  function setTemplate(next: WorkoutTemplate) { setEdited(next); startId.current = undefined }

  function selectTemplate(next?: WorkoutTemplate, id?: string, slug?: string) {
    setEdited(slug ? undefined : next)
    setSavedId(id ?? null)
    setSelectedSlug(slug)
    startId.current = undefined
    setMessage(next ? `${next.title || 'Workout'} loaded in the builder.` : 'New workout ready to edit.')
    document.getElementById('workout-builder')?.scrollIntoView({ behavior: 'instant' })
  }

  async function refresh(collection: string) {
    await queryClient.invalidateQueries({ queryKey: ['training', collection] })
  }

  function report(caught: unknown) {
    setError(caught instanceof Error ? caught.message : 'Training could not be updated.')
    requestAnimationFrame(() => builderAlert.current?.focus())
  }

  async function submit(action: 'save' | 'duplicate' | 'start') {
    if (submitLock.current) return
    setError('')
    setMessage('')
    if (!template.title.trim()) { report(new Error('Give your workout a name.')); return }
    if (!template.steps.length && (action !== 'start' || category !== 'conditioning')) {
      report(new Error('Add at least one exercise to this workout.'))
      return
    }
    if (action === 'start' && plannedWorkout) {
      router.push(`/training/live/${plannedWorkout.id}`)
      return
    }
    submitLock.current = true
    setBusy(true)
    try {
      if (action === 'start') {
        const id = startId.current ?? crypto.randomUUID()
        startId.current = id
        const data = {
          ...createWorkout(template, plannedActivityId),
          templateId: sourceRecord?.id,
          templateSlug: sourceRoutine?.slug,
          notes: template.description || undefined,
        }
        const workout = await trainingClient.create('workouts', data, id)
        await Promise.all([refresh('workouts'), refresh('activities')])
        router.push(`/training/live/${workout.id}`)
      } else {
        const updating = action === 'save' && sourceRecord
        const data = { ...template, title: action === 'duplicate' ? `${template.title.trim().slice(0, 193)} (copy)` : template.title.trim() }
        const record = updating
          ? await trainingClient.update('templates', sourceRecord.id, sourceRecord.version, data)
          : await trainingClient.create('templates', data)
        await refresh('templates')
        setSavedId(record.id)
        setEdited(record.data)
        setSelectedSlug(undefined)
        setMessage(action === 'duplicate' ? 'Workout copied.' : 'Workout saved.')
      }
    } catch (caught) {
      report(caught)
    } finally {
      setBusy(false)
      submitLock.current = false
    }
  }

  async function setExerciseFavourite(slug: string) {
    if (favouriteBusy) return
    setFavouriteBusy(true)
    setError('')
    try {
      const record = favouritesQuery.data?.find(item => item.data.exerciseSlug === slug)
      if (record) await trainingClient.remove('exercise_favourites', record.id, record.version)
      else await trainingClient.create('exercise_favourites', { exerciseSlug: slug })
      await refresh('exercise_favourites')
    } catch (caught) { report(caught) }
    finally { setFavouriteBusy(false) }
  }

  async function toggleTemplateFavourite(record: TrainingRecord<WorkoutTemplate>) {
    if (favouriteBusy) return
    setFavouriteBusy(true)
    setError('')
    try {
      const favourite = !record.data.favourite
      await trainingClient.update('templates', record.id, record.version, { ...record.data, favourite })
      if (record.id === savedId && edited) setEdited({ ...edited, favourite })
      await refresh('templates')
    } catch (caught) { report(caught) }
    finally { setFavouriteBusy(false) }
  }

  async function saveCustom(exercise: ExerciseInput) {
    await trainingClient.create('exercises', exercise)
    await refresh('exercises')
    setMessage('Private exercise added.')
  }

  const timeZone = preferences?.timeZone ?? legacyUnits?.timeZone ?? getDeviceTimeZone()
  const today = dateInZone(new Date(), timeZone)
  const weekStart = firstDayOfWeek(today)
  const completed = history.filter(record => record.data.status === 'completed')
  const recordDate = (record: TrainingRecord<WorkoutSession>) => dateInZone(new Date(record.data.completedAt ?? record.data.startedAt), timeZone)
  const weekHistory = completed.filter(record => recordDate(record) >= weekStart && recordDate(record) <= today)
  const activeDays = new Set(weekHistory.map(recordDate)).size
  const weekMinutes = weekHistory.reduce((sum, record) => sum + (record.data.durationMinutes ?? 0), 0)
  const regionCounts = new Map<string, number>()
  if (category === 'mobility') {
    weekHistory.forEach(record => record.data.exercises.forEach((step, index) => {
      if (record.data.skipped?.includes(index) || index >= (record.data.currentStep ?? 0)) return
      exercises.find(exercise => exercise.slug === step.exerciseSlug)?.bodyRegions.forEach(region => regionCounts.set(region, (regionCounts.get(region) ?? 0) + 1))
    }))
  }
  const mostTrainedRegion = [...regionCounts].sort((first, second) => second[1] - first[1])[0]?.[0]
  const historyItems = history.slice(0, 6)
  const selectedTemplateIsDirty = Boolean(edited && JSON.stringify(edited) !== JSON.stringify(sourceRecord?.data ?? builtInTemplate))
  const unavailable = templateQuery.isError || customQuery.isError || favouritesQuery.isError || historyQuery.isError || activityQuery.isError
  const awaitingSelected = Boolean(savedId && templateQuery.isPending) || Boolean(plannedActivityId && activityQuery.isPending)
  const invalidReference = Boolean(selectedSlug && !sourceRoutine && !sourceRecord && edited === undefined && !programme)
    || Boolean(savedId && templateQuery.isSuccess && !sourceRecord && !edited)

  return (
    <div className="space-y-10">
      {(unavailable || invalidReference) && <p className="rounded-lg border border-destructive/40 p-3 text-sm text-destructive" role="alert">
        {unavailable ? 'Some saved training data could not be loaded. Try refreshing this page.' : 'The selected routine is unavailable. Choose another routine or build your own.'}
      </p>}
      {error && <p ref={builderAlert} tabIndex={-1} className="sticky top-2 z-20 rounded-lg border border-destructive/40 bg-background p-3 text-sm text-destructive" role="alert">{error}</p>}
      {message && <p className="sr-only" role="status">{message}</p>}
      {plannedWorkout && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/45 px-4 py-3">
        <p>{plannedWorkout.data.title} · {plannedWorkout.data.status === 'completed' ? 'Completed' : 'In progress'}</p>
        <Button asChild className="min-h-11"><Link href={`/training/live/${plannedWorkout.id}`}>{plannedWorkout.data.status === 'completed' ? 'View workout' : 'Resume workout'}</Link></Button>
      </div>}
      <nav aria-label="On this page" className="flex flex-wrap gap-4 border-b border-border">
        <a href="#available-routines" className="inline-flex min-h-11 items-center text-sm font-medium hover:text-primary">Routines</a>
        <a href="#workout-builder" className="inline-flex min-h-11 items-center text-sm font-medium hover:text-primary">Workout builder</a>
        <a href="#exercise-library" className="inline-flex min-h-11 items-center text-sm font-medium hover:text-primary">Exercise library</a>
      </nav>
      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.075fr)] xl:items-start">
        <div className="space-y-8">
          <section className="space-y-4" aria-labelledby="available-routines">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-2xl font-semibold tracking-tight" id="available-routines">Routines</h2>
              <Button type="button" className="min-h-11" variant="outline" onClick={() => selectTemplate(blankTemplate(category))}>New workout</Button>
            </div>
            {routines.length > 0 && <div className="divide-y divide-border rounded-xl border border-border bg-card">
              {routines.map(routine => (
                <div key={routine.slug} className="flex items-center gap-1 px-3 sm:px-4">
                  <button type="button" className="min-h-14 flex-1 py-3 text-left hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" onClick={() => selectTemplate(routineTemplate(routine, getCatalogExercise), undefined, routine.slug)}>
                    <span className="block font-medium">{routine.name}</span>
                    <span className="text-sm text-muted-foreground">{routine.durationMinutes} min · {routine.style}</span>
                  </button>
                  <Button asChild variant="ghost" size="icon" className="size-11"><Link aria-label={`Schedule ${routine.name}`} href={scheduleHref(category, routine.slug)}><CalendarPlus aria-hidden /></Link></Button>
                </div>
              ))}
            </div>}
            {category === 'strength' && <Button asChild variant="outline" className="min-h-11"><Link href="/programmes">Browse strength programmes <ChevronRight aria-hidden /></Link></Button>}
            {category === 'conditioning' && <IntervalBuilder apply={(title, steps) => selectTemplate({ ...blankTemplate(category), title, steps })} />}
            <section aria-label="Your saved routines" className="space-y-2">
              <h3 className="text-base font-semibold">Saved routines</h3>
              {templateQuery.isPending && <p className="text-sm text-muted-foreground" role="status">Loading saved routines…</p>}
              {templateQuery.isSuccess && !customTemplates.length && <p className="text-sm text-muted-foreground">Saved workouts will appear here.</p>}
              <div className="divide-y divide-border">
                {[...customTemplates].sort((a, b) => Number(b.data.favourite) - Number(a.data.favourite)).map(record => (
                  <div key={record.id} className="flex items-center justify-between gap-1">
                    <button type="button" className="min-h-11 flex-1 text-left text-sm hover:text-primary" onClick={() => selectTemplate(record.data, record.id)}>{record.data.title}</button>
                    <Button variant="ghost" size="icon" className="size-11" aria-label={`${record.data.favourite ? 'Unfavourite' : 'Favourite'} ${record.data.title}`} aria-pressed={record.data.favourite} onClick={() => toggleTemplateFavourite(record)} disabled={favouriteBusy}>
                      <Heart aria-hidden className={record.data.favourite ? 'fill-current text-primary' : ''} />
                    </Button>
                    <Button asChild variant="ghost" size="icon" className="size-11"><Link aria-label={`Schedule ${record.data.title}`} href={scheduleHref(category, undefined, record.id)}><CalendarPlus aria-hidden /></Link></Button>
                  </div>
                ))}
              </div>
            </section>
          </section>
          <section aria-labelledby="training-history" className="space-y-3">
            <h2 id="training-history" className="text-2xl font-semibold tracking-tight">Recent workouts</h2>
            {historyQuery.isPending && <p role="status" className="text-sm text-muted-foreground">Loading workouts…</p>}
            {historyQuery.isSuccess && <p className="text-sm text-muted-foreground">This week · {weekHistory.length} completed · {weekMinutes} min · {activeDays} {activeDays === 1 ? 'day' : 'days'}{mostTrainedRegion && ` · Most trained: ${mostTrainedRegion.replaceAll('-', ' ')}`}</p>}
            {category === 'mobility' && <div className="flex flex-wrap gap-4 text-sm">
              <Link href="/progress#benchmarks" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">Track range of motion</Link>
              <Link href="/recovery#discomfort" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">Record mobility limitations</Link>
            </div>}
            {historyItems.map(record => <Link key={record.id} href={`/training/live/${record.id}`} className="flex min-h-11 items-center justify-between gap-3 rounded-lg border border-border px-3 text-sm hover:bg-muted/50">
              <span className="font-medium">{record.data.title}</span>
              <span className="text-muted-foreground">{record.data.status === 'completed' ? 'Completed' : 'Resume'}</span>
            </Link>)}
          </section>
        </div>
        {awaitingSelected ? <p role="status" className="text-sm text-muted-foreground">Loading the selected workout…</p> : <TemplateBuilder
          template={template}
          onChange={setTemplate}
          busy={busy || Boolean(activityQuery.isError)}
          selectedTemplate={Boolean(sourceRecord) || Boolean(sourceRoutine)}
          plannedActivity={Boolean(plannedActivityId)}
          unit={unit}
          scheduleHref={!selectedTemplateIsDirty && (sourceRecord || sourceRoutine) ? scheduleHref(category, sourceRoutine?.slug, sourceRecord?.id) : undefined}
          onStart={() => submit('start')}
          onSave={copy => submit(copy ? 'duplicate' : 'save')}
        />}
      </div>
      <ExerciseLibrary
        category={category} exercises={exercises} favourites={favouriteIds} onFavourite={setExerciseFavourite} saveCustom={saveCustom}
        onAdd={exercise => {
          if (template.steps.length >= 100) { report(new Error('A workout can include up to 100 exercises.')); return }
          const step = exerciseStep(exercise)
          setTemplate({
            ...template,
            title: template.title || exercise.name,
            steps: [...template.steps, category === 'strength' ? step : { ...step, repetitions: category === 'solo' ? 8 : undefined, durationSeconds: category === 'solo' ? undefined : 30 }],
          })
          setMessage(`${exercise.name} added to the workout builder.`)
        }}
      />
    </div>
  )
}
