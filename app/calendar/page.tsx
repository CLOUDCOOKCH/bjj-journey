"use client"

import { Suspense, useEffect, useState } from "react"
import Link from "next/link"
import { redirect, useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useQueryClient } from "@tanstack/react-query"
import { ExternalLink, Pencil, Play, Repeat, Settings } from "lucide-react"
import CalendarView, { CategoryDot } from "@/components/calendar-view"
import { CalendarActivityForm } from "@/components/calendar-activity-form"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { PageHeader } from "@/components/page-header"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { CalendarSkeleton } from "@/components/loading/page-skeleton"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/lib/hooks"
import { routineCatalog } from "@/lib/training/catalog"
import { trainingClient } from "@/lib/training/client"
import {
  activityCategories, activityLabels, activityLaunchUrl, activityStatusLabels,
  addCalendarDays, addCalendarMonths, dateInZone, firstDayOfWeek, formatCalendarDate,
  getDeviceTimeZone, getOccurrences, isCalendarDate, journalCategory, journalSessionLabel,
  type ActivityOccurrence, type PlannedActivity,
} from "@/lib/training/planner"
import { getConcreteOccurrence, occurrenceUuid, trainingQueryKey, useCalendarJournalEntries, useTrainingList } from "@/lib/training/planner-client"
import { goalMetrics, weeklyGoalProgress, type TrainingSample } from "@/lib/training/performance"
import type { TrainingData } from "@/lib/training/schemas"

type Editor =
  | { scope: "create"; initial: PlannedActivity }
  | { scope: "occurrence" | "edit" | "series"; initial: PlannedActivity; occurrence: ActivityOccurrence }

function activityKey(occurrence: ActivityOccurrence) {
  return `${occurrence.record.id}:${occurrence.date}`
}

function CalendarContent() {
  const router = useRouter()
  const search = useSearchParams()
  const query = useQueryClient()
  const { data: session, status } = useSession()
  const authenticated = status === "authenticated"
  const entries = useCalendarJournalEntries()
  const profile = useProfile(authenticated)
  const activities = useTrainingList<PlannedActivity>("activities")
  const workouts = useTrainingList<TrainingData<"workouts">>("workouts")
  const templates = useTrainingList<TrainingData<"templates">>("templates")
  const goals = useTrainingList<TrainingData<"goals">>("goals")
  const recovery = useTrainingList<TrainingData<"recovery">>("recovery")
  const preferences = useTrainingList<TrainingData<"preferences">>("preferences")
  const timeZone = preferences.data?.find(({ data }) => data.key === "training")?.data.timeZone ?? getDeviceTimeZone()
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])
  const today = dateInZone(now, timeZone)
  const [selectedDate, setSelectedDate] = useState<string>()
  const requestedDate = search.get("date")
  const date = selectedDate ?? (isCalendarDate(requestedDate) ? requestedDate : today)
  const [activeId, setActiveId] = useState("")
  const [localEditor, setEditor] = useState<Editor | null>()
  const [pending, setPending] = useState(false)
  const [deleteId, setDeleteId] = useState("")
  const [feedback, setFeedback] = useState<{ error: boolean; text: string } | null>(null)
  const categoryParam = search.get("category")
  const defaultCategory = activityCategories.find((category) => category === categoryParam)

  function newActivity(): PlannedActivity {
    const category = defaultCategory ?? "bjj_gi"
    const preset = routineCatalog.find((template) => template.category === category && template.slug === search.get("template"))
    const saved = templates.data?.find((template) => template.data.category === category && template.id === search.get("templateId"))
    return {
      date, category, timeZone, status: "planned", durationMinutes: preset?.durationMinutes ?? (category === "rest" ? 0 : 60),
      title: preset?.name ?? saved?.data.title ?? activityLabels[category],
      templateSlug: preset?.slug,
      workoutTemplateId: saved?.id,
    }
  }

  const editor = localEditor === undefined && defaultCategory && !templates.isPending
    ? { scope: "create" as const, initial: newActivity() } : localEditor

  if (status === "unauthenticated") redirect("/auth/login")
  if (status === "loading" || entries.isLoading || profile.isLoading || activities.isLoading || workouts.isLoading || preferences.isLoading) {
    return <CalendarSkeleton belt={profile.data?.belt} />
  }
  if (!session?.user?.id) redirect("/auth/login")

  const records = activities.data ?? []
  const first = firstDayOfWeek(`${date.slice(0, 7)}-01`)
  const last = addCalendarDays(firstDayOfWeek(addCalendarDays(addCalendarMonths(date, 1), -1)), 6)
  const occurrences = getOccurrences(records, first, last)
  const agenda = occurrences.filter((occurrence) => occurrence.date === date)
  const weekStart = firstDayOfWeek(date)
  const weekEnd = addCalendarDays(weekStart, 6)
  const storedEntries = entries.data ?? []
  const linkedJournal = new Set(records.map(({ data }) => data.journalEntryId).filter(Boolean))
  const history = storedEntries.filter((entry) => !linkedJournal.has(entry.id))
  const workoutDrafts = new Map((workouts.data ?? []).filter(({ data }) => data.status === "in_progress" && data.plannedActivityId)
    .map(({ id, data }) => [data.plannedActivityId!, id]))
  const linkedWorkouts = new Map((workouts.data ?? []).filter(({ data }) => data.status === "completed" && data.plannedActivityId)
    .map(({ id, data }) => [data.plannedActivityId!, id]))
  const completedWorkouts = (workouts.data ?? []).filter(({ data }) => data.status === "completed")
    .map(({ id, data }) => ({ id, ...data, date: dateInZone(new Date(data.completedAt ?? data.startedAt), timeZone) }))
  const workoutHistory = completedWorkouts.filter(({ plannedActivityId }) => !plannedActivityId)
  const samples: TrainingSample[] = [
    ...completedWorkouts.map(({ category, date, durationMinutes }) => ({ category, date, durationMinutes })),
    ...storedEntries.map(({ entryDate, durationMinutes }) => ({ category: "bjj" as const, date: entryDate, durationMinutes })),
  ]
  const checkIns = (recovery.data ?? []).map(({ data }) => data)
  const weeklyTargets = (goals.data ?? []).filter(({ data }) => data.metric !== "benchmark")
    .map(({ id, data }) => ({
      id, label: data.name ?? goalMetrics[data.metric], target: data.target,
      progress: weeklyGoalProgress(data, samples, checkIns, weekStart, weekEnd).value ?? 0,
    }))
  const items = new Map<string, {
    id: string; title: string; category: PlannedActivity["category"]; movable: boolean; select: () => void
  }[]>()
  for (const occurrence of occurrences) {
    const { data } = occurrence.record
    const id = activityKey(occurrence)
    items.set(occurrence.date, [...(items.get(occurrence.date) ?? []), {
      id, title: data.title, category: data.category, movable: data.status === "planned" && !pending,
      select: () => setActiveId(id),
    }])
  }
  for (const entry of history) {
    items.set(entry.entryDate, [...(items.get(entry.entryDate) ?? []), {
      id: entry.id, title: entry.title || journalSessionLabel(entry.sessionType), category: journalCategory(entry.sessionType),
      movable: false, select: () => setActiveId(entry.id),
    }])
  }

  for (const workout of workoutHistory) {
    items.set(workout.date, [...(items.get(workout.date) ?? []), {
      id: workout.id, title: workout.title, category: workout.category,
      movable: false, select: () => setActiveId(workout.id),
    }])
  }

  function clearSelection(next: string) {
    setSelectedDate(next)
    setActiveId("")
    setDeleteId("")
  }

  async function run(action: () => Promise<unknown>, text?: string) {
    setPending(true)
    setFeedback(null)
    try {
      await action()
      if (text) setFeedback({ error: false, text })
    } catch (error) {
      setFeedback({ error: true, text: error instanceof Error ? error.message : "The planner could not save this change." })
    } finally {
      await query.invalidateQueries({ queryKey: trainingQueryKey("activities") })
      setPending(false)
    }
  }

  function save(data: PlannedActivity) {
    if (!editor) return
    void run(async () => {
      if (editor.scope === "create") await trainingClient.create("activities", data)
      else if (editor.scope === "occurrence") await getConcreteOccurrence(editor.occurrence, data)
      else {
        const { record } = editor.occurrence
        await trainingClient.update("activities", record.id, record.version, data)
      }
      setEditor(null)
      clearSelection(data.date)
    }, "Activity saved.")
  }

  function moveOrSetStatus(occurrence: ActivityOccurrence, delta: Partial<PlannedActivity>, message: string) {
    void run(async () => {
      const { record } = occurrence
      const data = { ...record.data, date: occurrence.date, ...delta }
      if (occurrence.virtual) await getConcreteOccurrence(occurrence, data)
      else await trainingClient.update("activities", record.id, record.version, data)
      if (delta.date) clearSelection(delta.date)
    }, message)
  }

  function remove(occurrence: ActivityOccurrence) {
    const { record } = occurrence
    void run(async () => {
      await trainingClient.remove("activities", record.id, record.version)
      setDeleteId("")
      setActiveId("")
    }, "Activity deleted.")
  }

  function copyPreviousWeek() {
    void run(async () => {
      const sourceStart = addCalendarDays(weekStart, -7)
      const sourceEnd = addCalendarDays(weekStart, -1)
      const sources = getOccurrences(records, sourceStart, sourceEnd).filter(({ record }) => ["planned", "completed"].includes(record.data.status))
      const existing = getOccurrences(records, weekStart, weekEnd)
      const copies = []
      for (const occurrence of sources) {
        const target = addCalendarDays(occurrence.date, 7)
        const old = occurrence.record.data
        if (existing.some((item) => item.date === target && item.record.data.category === old.category
          && item.record.data.title === old.title && item.record.data.time === old.time)) continue
        copies.push({
          id: await occurrenceUuid(occurrence.record.id + ":copy-week", target),
          data: { ...old, date: target, status: "planned" as const, repeat: undefined, seriesId: undefined, occurrenceDate: undefined, journalEntryId: undefined },
        })
      }
      if (copies.length) await trainingClient.createBatch(copies)
      setFeedback({ error: false, text: copies.length === 0 ? "There are no new activities to copy." : `Copied ${copies.length} ${copies.length === 1 ? "activity" : "activities"} into this week.` })
    })
  }

  function launch(occurrence: ActivityOccurrence) {
    void run(async () => {
      const record = await getConcreteOccurrence(occurrence)
      const liveId = workoutDrafts.get(record.id)
      router.push(liveId ? `/training/live/${liveId}` : activityLaunchUrl(record))
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile.data?.belt} name={profile.data?.user?.name ?? undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-24 lg:pb-8">
        <PageHeader title="Training planner" subtitle={timeZone} actions={
          <Button asChild variant="ghost" size="icon"><Link href="/settings" aria-label="Training settings"><Settings /></Link></Button>
        } />
        <div className="mx-auto grid max-w-[96rem] gap-5 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_17rem]">
          <div className="min-w-0 space-y-3">
            {feedback && <p role={feedback.error ? "alert" : "status"} className={feedback.error ? "rounded-lg border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive" : "text-sm font-medium text-primary"}>{feedback.text}</p>}
            {(entries.isError || activities.isError || workouts.isError) && (
              <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-sm">
                Some training records could not be loaded.
                <Button variant="outline" size="sm" onClick={() => { void entries.refetch(); void activities.refetch(); void workouts.refetch() }}>Retry</Button>
              </div>
            )}
            <CalendarView date={date} today={today} onDateChange={clearSelection} items={items}
              onAdd={() => { setFeedback(null); setEditor({ scope: "create", initial: newActivity() }) }}
              onMove={(id, next) => {
                const occurrence = occurrences.find((item) => activityKey(item) === id)
                if (occurrence && !pending && occurrence.date !== next) moveOrSetStatus(occurrence, { date: next }, "Activity rescheduled.")
              }}
              editForm={editor && (
                <CalendarActivityForm key={editor.scope === "create" ? `new:${editor.initial.date}:${editor.initial.workoutTemplateId ?? ""}` : `${editor.scope}:${activityKey(editor.occurrence)}`}
                  scope={editor.scope} initial={editor.initial} templates={templates.data ?? []} saving={pending}
                  onSave={save} onCancel={() => setEditor(null)} />
              )}
              agenda={
                <section className="p-4 sm:p-6" aria-label="Selected day activities">
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <h2 className="text-base font-semibold">{formatCalendarDate(date, { weekday: "long", month: "long", day: "numeric" })}</h2>
                    <Button asChild variant="ghost" size="sm"><Link href={`/start-training?date=${date}`}>Log mat session</Link></Button>
                  </div>
                  {agenda.length === 0 && !history.some((entry) => entry.entryDate === date) && !workoutHistory.some((workout) => workout.date === date) && <p className="py-3 text-sm text-muted-foreground">No activities are logged or scheduled for this day.</p>}
                  <ul className="divide-y">
                    {agenda.map((occurrence) => {
                      const { record, virtual } = occurrence
                      const { data } = record
                      const id = activityKey(occurrence)
                      const selected = activeId === id
                      const movable = data.status === "planned"
                      const canDelete = !virtual && !data.seriesId && !data.repeat && data.status !== "in_progress" && data.status !== "completed"
                      const canLaunch = data.status === "planned" || data.status === "in_progress"
                      return <li key={id} className="py-2">
                        <button type="button" className="flex min-h-11 w-full items-center gap-3 rounded text-left text-sm focus-visible:outline-2 focus-visible:outline-ring" aria-expanded={selected} onClick={() => setActiveId(selected ? "" : id)}>
                          <CategoryDot category={data.category} />
                          <span className="min-w-0 flex-1"><span className="block truncate font-medium">{data.title}</span><span className="text-xs text-muted-foreground">{activityLabels[data.category]}{data.time ? ` · ${data.time} ${data.timeZone}` : ""}{data.durationMinutes ? ` · ${data.durationMinutes} min` : ""}</span></span>
                          {virtual && <Repeat className="size-3 shrink-0 text-muted-foreground" aria-label="Recurring" />}
                          <span className="shrink-0 rounded bg-muted px-2 py-1 text-xs font-medium">{activityStatusLabels[data.status]}</span>
                        </button>
                        {selected && (
                          <div className="space-y-2 pb-1 pl-5">
                            {data.notes && <p className="whitespace-pre-wrap break-words text-sm text-muted-foreground">{data.notes}</p>}
                            <div className="flex flex-wrap gap-1.5">
                              {canLaunch && data.category !== "rest" && <Button size="sm" disabled={pending} onClick={() => launch(occurrence)}><Play />{data.status === "in_progress" ? "Resume" : "Start"}</Button>}
                              {movable && <>
                                {data.category === "rest" && <Button size="sm" disabled={pending} onClick={() => moveOrSetStatus(occurrence, { status: "completed" }, "Rest day completed.")}>Mark complete</Button>}
                                <Button size="sm" variant="outline" disabled={pending} onClick={() => setEditor({ scope: virtual ? "occurrence" : "edit", initial: { ...data, date }, occurrence })}><Pencil /> Edit{virtual ? " occurrence" : ""}</Button>
                                {virtual && <Button size="sm" variant="ghost" disabled={pending} onClick={() => setEditor({ scope: "series", initial: data, occurrence })}>Edit series</Button>}
                                <Button size="sm" variant="ghost" disabled={pending} onClick={() => moveOrSetStatus(occurrence, { status: "skipped" }, "Activity skipped.")}>Skip</Button>
                                <Button size="sm" variant="ghost" disabled={pending} onClick={() => moveOrSetStatus(occurrence, { status: "cancelled" }, "Activity cancelled.")}>Cancel activity</Button>
                              </>}
                              {canDelete && deleteId !== record.id && <Button size="sm" variant="ghost" disabled={pending} onClick={() => setDeleteId(record.id)}>Delete</Button>}
                              {(data.status === "skipped" || data.status === "cancelled") && <Button size="sm" variant="outline" disabled={pending} onClick={() => moveOrSetStatus(occurrence, { status: "planned" }, "Activity restored.")}>Restore</Button>}
                              {linkedWorkouts.has(record.id) && <Button asChild size="sm" variant="outline"><Link href={`/training/live/${linkedWorkouts.get(record.id)}`}><ExternalLink /> View workout</Link></Button>}
                              {data.journalEntryId && <Button asChild size="sm" variant="outline"><Link href={`/start-training?date=${date}&entryId=${data.journalEntryId}`}><ExternalLink /> View journal</Link></Button>}
                            </div>
                            {canDelete && deleteId === record.id && (
                              <div className="flex flex-wrap items-center gap-2 rounded border px-2 py-1 text-sm">
                                <span>Delete this activity?</span>
                                <Button size="sm" variant="destructive" disabled={pending} onClick={() => remove(occurrence)}>Delete activity</Button>
                                <Button size="sm" variant="ghost" onClick={() => setDeleteId("")}>Keep activity</Button>
                              </div>
                            )}
                          </div>
                        )}
                      </li>
                    })}
                    {history.filter((entry) => entry.entryDate === date).map((entry) => (
                      <li key={entry.id}><Link className="flex min-h-12 items-center gap-3 rounded py-2 text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" href={`/start-training?date=${date}&entryId=${entry.id}`}>
                        <CategoryDot category={journalCategory(entry.sessionType)} />
                        <span className="min-w-0 flex-1 truncate font-medium">{entry.title || journalSessionLabel(entry.sessionType)}</span>
                        <span className="text-xs text-muted-foreground">{entry.durationMinutes ? `${entry.durationMinutes} min · ` : ""}Completed</span>
                      </Link></li>
                    ))}
                    {workoutHistory.filter((workout) => workout.date === date).map((workout) => (
                      <li key={workout.id}><Link className="flex min-h-12 items-center gap-3 rounded py-2 text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" href={`/training/live/${workout.id}`}>
                        <CategoryDot category={workout.category} />
                        <span className="min-w-0 flex-1 truncate font-medium">{workout.title}</span>
                        <span className="text-xs text-muted-foreground">{workout.durationMinutes ?? 0} min · Completed</span>
                      </Link></li>
                    ))}
                  </ul>
                </section>
              }
            />
          </div>
          <CalendarSidebar records={records} entries={storedEntries} weekStart={weekStart} now={now} timeZone={timeZone} pending={pending}
            workouts={workoutHistory} weeklyTargets={weeklyTargets} copyPreviousWeek={copyPreviousWeek} onSelectDate={clearSelection} />
        </div>
      </main>
    </div>
  )
}

export default function CalendarPage() {
  return <Suspense fallback={<CalendarSkeleton />}><CalendarContent /></Suspense>
}
