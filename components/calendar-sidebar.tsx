import Link from "next/link"
import { Bell, CalendarPlus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CategoryDot } from "@/components/calendar-view"
import { activityCategories, activityLabels, addCalendarDays, getDueReminders, getUpcomingReminders, getOccurrences, journalCategory, type ActivityCategory, type PlannedActivity, type TrainingRecord } from "@/lib/training/planner"
import type { JournalEntry } from "@/lib/db/schema"

interface Props {
  records: TrainingRecord<PlannedActivity>[]
  entries: JournalEntry[]
  workouts: { category: ActivityCategory; date: string }[]
  weekStart: string
  now: Date
  timeZone: string
  pending: boolean
  weeklyTargets: { id: string; label: string; progress: number; target: number }[]
  copyPreviousWeek: () => void
  onSelectDate: (date: string) => void
}

export function CalendarSidebar({ records, entries, workouts, weekStart, now, timeZone, pending, weeklyTargets, copyPreviousWeek, onSelectDate }: Props) {
  const weekEnd = addCalendarDays(weekStart, 6)
  const occurrences = getOccurrences(records, weekStart, weekEnd)
  const linked = new Set(records.map(({ data }) => data.journalEntryId).filter(Boolean))
  const logged = entries.filter((entry) => entry.entryDate >= weekStart && entry.entryDate <= weekEnd && !linked.has(entry.id))
  const countedMat = logged.filter(({ sessionType }) => ["gi", "no_gi", "open_mat", "competition"].includes(sessionType))
  const otherMat = logged.length - countedMat.length
  const independentWorkouts = workouts.filter(({ date }) => date >= weekStart && date <= weekEnd)
  const due = getDueReminders(records, now, timeZone)
  const upcoming = getUpcomingReminders(records, now, timeZone).filter(({ record, date }) => !due.some((item) => item.record.id === record.id && item.date === date))

  return (
    <aside className="space-y-4 self-start">
      <section className="rounded-xl border bg-card p-4">
        <h2 className="text-sm font-semibold">Weekly activity</h2>
        <p className="mt-1 text-xs text-muted-foreground">Completed / scheduled</p>
        <ul className="mt-2 divide-y">
          {activityCategories.map((category) => {
            const scheduled = occurrences.filter(({ record }) => record.data.category === category && record.data.status !== "cancelled")
            const completed = scheduled.filter(({ record }) => record.data.status === "completed").length
              + countedMat.filter((entry) => journalCategory(entry.sessionType) === category).length
              + independentWorkouts.filter((workout) => workout.category === category).length
            if (!scheduled.length && !completed) return null
            return <li key={category} className="flex items-center gap-2 py-2 text-sm">
              <CategoryDot category={category} /><span className="flex-1">{activityLabels[category]}</span>
              <span className="tabular-nums font-medium">{completed} / {scheduled.length}</span>
            </li>
          })}
          {otherMat > 0 && <li className="flex items-center justify-between gap-2 py-2 text-sm"><span>Other mat sessions</span><span className="tabular-nums font-medium">{otherMat} / 0</span></li>}
          {!occurrences.some(({ record }) => record.data.status !== "cancelled") && !logged.length && !independentWorkouts.length && <li className="py-2 text-sm text-muted-foreground">Schedule your mat sessions, workouts and rest days.</li>}
        </ul>
        <Button variant="outline" className="mt-3 w-full" disabled={pending} onClick={copyPreviousWeek}><CalendarPlus /> Copy previous week</Button>
      </section>
      <section className="rounded-xl border bg-card p-4" aria-label="Weekly targets">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">Weekly targets</h2>
          <Link className="rounded text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring" href="/progress">Manage goals</Link>
        </div>
        {weeklyTargets.length ? <ul className="mt-2 divide-y">{weeklyTargets.map(({ id, label, progress, target }) => (
          <li key={id} className="py-2">
            <div className="flex justify-between gap-2 text-sm"><span>{label}</span><span className="tabular-nums">{progress} / {target}</span></div>
            <progress className="mt-1 h-1.5 w-full accent-primary" aria-label={label} max={target} value={Math.min(progress, target)} />
          </li>
        ))}</ul> : <p className="mt-2 text-sm text-muted-foreground">Add a weekly goal to track it here.</p>}
      </section>
      <section className="rounded-xl border bg-card p-4" aria-live="polite">
        <h2 className="flex items-center gap-2 text-sm font-semibold"><Bell className="size-4" /> Session reminders</h2>
        {due.length ? <ul className="mt-2 divide-y">{due.map(({ record, date }) => <li key={`${record.id}:${date}`}>
          <button type="button" className="min-h-11 w-full rounded text-left text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" onClick={() => onSelectDate(date)}>
            <span className="font-medium">{record.data.title}</span><span className="block text-xs text-muted-foreground">{record.data.time} {record.data.timeZone}</span>
          </button>
        </li>)}</ul> : <p className="mt-2 text-sm text-muted-foreground">No reminders are due.{!upcoming.length && " Set a reminder when scheduling a timed activity."}</p>}
        {!!upcoming.length && <>
          <h3 className="mt-3 text-xs font-medium text-muted-foreground">Upcoming this week</h3>
          <ul className="mt-1 divide-y">{upcoming.slice(0, 4).map(({ record, date, reminder }) => <li key={`${record.id}:${date}`}>
            <button type="button" className="min-h-11 w-full rounded py-1 text-left text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring" onClick={() => onSelectDate(date)}>
              <span className="font-medium">{record.data.title}</span>
              <span className="block text-xs text-muted-foreground">{new Intl.DateTimeFormat(undefined, { timeZone, dateStyle: "medium", timeStyle: "short" }).format(new Date(reminder))}</span>
            </button>
          </li>)}</ul>
        </>}
      </section>
    </aside>
  )
}
