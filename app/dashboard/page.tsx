"use client"

import { useEffect, useState, type ReactNode } from "react"
import Link from "next/link"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { ArrowRight, Settings } from "lucide-react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { PageHeader } from "@/components/page-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { DashboardWidgets, type DashboardWidget } from "@/components/dashboard-widgets"
import { RecentEntries } from "@/components/recent-entries"
import { MonthlyChart } from "@/components/monthly-chart"
import { DashboardSkeleton } from "@/components/loading/page-skeleton"
import { CategoryDot } from "@/components/calendar-view"
import { Button } from "@/components/ui/button"
import { useProfile } from "@/lib/hooks"
import { useCalendarJournalEntries, useTrainingList } from "@/lib/training/planner-client"
import {
  activityLabels, activityStatusLabels, addCalendarDays, addCalendarMonths, dateInZone, firstDayOfWeek,
  formatCalendarDate, getDeviceTimeZone, getDueReminders, getOccurrences, matSessionStreak, type ActivityOccurrence,
} from "@/lib/training/planner"
import {
  defaultReadinessRules, goalMetrics, recommendReadiness, strengthRecords, trainingLoad, weeklyGoalProgress, type TrainingSample,
} from "@/lib/training/performance"
import type { TrainingData } from "@/lib/training/schemas"

const readinessActions: Record<string, { href: string; label: string }> = {
  "Gentle mobility": { href: "/training/mobility", label: "Choose a mobility routine" },
  "Light technical training": { href: "/training/solo", label: "Choose a solo technique drill" },
  "Reduced intensity": { href: "/calendar", label: "Review today's plan" },
  "Active recovery": { href: "/training/recovery", label: "Choose a recovery routine" },
  "Rest day": { href: "/calendar?category=rest", label: "Schedule rest" },
  "Normal training": { href: "/calendar", label: "Open today's plan" },
}

function Widget({ title, link, action = "Open", children }: { title: string; link?: string; action?: string; children: ReactNode }) {
  return <section className="h-full rounded-xl border bg-card p-4">
    <div className="mb-2 flex items-center justify-between gap-2">
      <h3 className="font-semibold">{title}</h3>
      {link && <Link href={link} className="inline-flex min-h-9 items-center gap-1 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
        {action} <ArrowRight className="size-3" />
      </Link>}
    </div>
    {children}
  </section>
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-muted-foreground">{children}</p>
}

function ScheduleList({ items }: { items: ActivityOccurrence[] }) {
  return <ul className="divide-y">{items.map(({ date, record }) => (
    <li key={`${record.id}:${date}`}>
      <Link href={`/calendar?date=${date}`} className="flex min-h-12 items-center gap-2 rounded py-2 text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
        <CategoryDot category={record.data.category} />
        <span className="min-w-0 flex-1"><span className="block truncate font-medium">{record.data.title}</span><span className="text-xs text-muted-foreground">{activityLabels[record.data.category]}{record.data.time ? ` · ${record.data.time}` : ""}</span></span>
        <span className="shrink-0 text-xs text-muted-foreground">{formatCalendarDate(date, { month: "short", day: "numeric" })}</span>
      </Link>
    </li>
  ))}</ul>
}

export default function DashboardPage() {
  const { status } = useSession()
  const profile = useProfile(status === "authenticated")
  const journal = useCalendarJournalEntries()
  const activities = useTrainingList<TrainingData<"activities">>("activities")
  const workouts = useTrainingList<TrainingData<"workouts">>("workouts")
  const prefs = useTrainingList<TrainingData<"preferences">>("preferences")
  const recovery = useTrainingList<TrainingData<"recovery">>("recovery")
  const competitions = useTrainingList<TrainingData<"competitions">>("competitions")
  const goals = useTrainingList<TrainingData<"goals">>("goals")
  const benchmarks = useTrainingList<TrainingData<"benchmarks">>("benchmarks")
  const benchmarkResults = useTrainingList<TrainingData<"benchmark-results">>("benchmark-results")

  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 30_000)
    return () => window.clearInterval(timer)
  }, [])

  if (status === "unauthenticated") redirect("/auth/login")
  if (status === "loading" || [profile, journal, activities, workouts, prefs].some((query) => query.isLoading)) {
    return <DashboardSkeleton belt={profile.data?.belt} />
  }
  const entries = journal.data ?? []
  const userPreferences = prefs.data ?? []
  const timeZone = userPreferences.find(({ data }) => data.key === "training")?.data.timeZone ?? getDeviceTimeZone()
  const today = dateInZone(now, timeZone)
  const start = firstDayOfWeek(today)
  const end = addCalendarDays(start, 6)
  const planned = activities.data ?? []
  const plan = getOccurrences(planned, today, addCalendarDays(today, 14))
  const todayPlan = plan.filter(({ date, record }) => date === today && record.data.status !== "cancelled")
  const upcoming = plan.filter(({ date, record }) => date > today && record.data.status === "planned").slice(0, 5)
  const due = getDueReminders(planned, now, timeZone)
  const completed = (workouts.data ?? []).filter(({ data }) => data.status === "completed").map(({ id, data }) => ({
    id, ...data, date: dateInZone(new Date(data.completedAt ?? data.startedAt), timeZone),
  })).sort((a, b) => b.date.localeCompare(a.date))
  const samples: TrainingSample[] = [
    ...completed.map(({ date, category, durationMinutes, sessionRpe }) => ({ date, category, durationMinutes, sessionRpe })),
    ...entries.map(({ entryDate, durationMinutes, sessionRpe }) => ({ date: entryDate, category: "bjj" as const, durationMinutes, sessionRpe })),
  ]
  const thisWeek = samples.filter(({ date }) => date >= start && date <= end)
  const weeklyTotals = trainingLoad(samples, start, end)
  const lastWeekLoad = trainingLoad(samples, addCalendarDays(start, -7), addCalendarDays(start, -1))
  const checkIns = (recovery.data ?? []).map(({ data }) => data)
  const latestCheckIn = checkIns.find(({ date }) => date === today)
  const readinessRules = userPreferences.find(({ data }) => data.key === "readiness")?.data.readiness ?? defaultReadinessRules
  const readiness = recommendReadiness(latestCheckIn, readinessRules)
  const readinessAction = readinessActions[readiness.label]
  const upcomingEvents = (competitions.data ?? []).filter(({ data }) => data.date >= today)
    .sort((a, b) => a.data.date.localeCompare(b.data.date)).slice(0, 3)
  const records = [...strengthRecords(completed.filter(({ category }) => category === "strength")).values()]
    .filter(({ heaviestKg, longestHoldSeconds }) => heaviestKg !== null || longestHoldSeconds !== null).slice(0, 4)
  const weightUnit = userPreferences.find(({ data }) => data.key === "training")?.data.weightUnit
    ?? userPreferences.find(({ data }) => data.key === "units")?.data.weightUnit ?? "kg"
  const monthStart = today.slice(0, 7) + "-01"
  const currentMonthSessions = entries.filter(({ entryDate }) => entryDate >= monthStart && entryDate <= today).length
  const currentStreak = matSessionStreak(entries.map(({ entryDate }) => entryDate), planned, today)
  const monthlyData = Array.from({ length: 6 }, (_, index) => {
    const month = addCalendarMonths(today, index - 5)
    return { month: formatCalendarDate(month, { month: "short" }), sessions: entries.filter(({ entryDate }) => entryDate.startsWith(month.slice(0, 7))).length }
  })

  const weeklyMetrics = [
    { name: "Mat time", value: weeklyTotals.byCategory.bjj ?? 0, unit: "min" },
    { name: "Strength", value: thisWeek.filter(({ category }) => category === "strength").length, unit: "workouts" },
    { name: "Mobility", value: weeklyTotals.byCategory.mobility ?? 0, unit: "min" },
    { name: "Conditioning", value: weeklyTotals.byCategory.conditioning ?? 0, unit: "min" },
  ]
  const widgets: DashboardWidget[] = [
    { id: "upcoming", label: "Upcoming training", content: <Widget title="Upcoming training" link="/calendar" action="Planner">
      {upcoming.length ? <ScheduleList items={upcoming} /> : <Empty>There are no upcoming activities in the next two weeks.</Empty>}
    </Widget> },
    { id: "recovery", label: "Recovery", content: <Widget title="Recovery" link="/recovery" action={latestCheckIn ? "Check-in" : "Check in"}>
      <Empty>{recovery.isError ? "Recovery could not be loaded." : latestCheckIn ? "Today’s check-in is complete." : "Record how you feel before training."}</Empty>
      {readinessRules.enabled && <>
        <p className="mt-2 text-sm font-semibold">{readiness.label}</p>
        {readiness.reasons.slice(0, 1).map((reason) => <Empty key={reason}>{reason}</Empty>)}
        {readinessAction && <Link className="mt-2 inline-flex min-h-10 items-center gap-1 rounded text-sm font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring" href={readinessAction.href}>
          {readinessAction.label} <ArrowRight className="size-3" />
        </Link>}
      </>}
      {!!checkIns.length && <p className="mt-2 text-xs text-muted-foreground">{new Set(checkIns.filter(({ date }) => date >= start && date <= end).map(({ date }) => date)).size} check-ins this week</p>}
    </Widget> },
    { id: "load", label: "Training load", content: <Widget title="Training load" link="/progress" action="Trends">
      {weeklyTotals.measuredSessions ? <><p className="text-2xl font-semibold tabular-nums">{weeklyTotals.load.toLocaleString()}</p>
        <Empty>This week · {weeklyTotals.measuredSessions} of {weeklyTotals.sessions} sessions had duration and RPE</Empty>
        {lastWeekLoad.measuredSessions > 0 && <p className="mt-2 text-xs text-muted-foreground">Last week: {lastWeekLoad.load.toLocaleString()}</p>}</> : <Empty>Log session exertion to see this week’s training load.</Empty>}
    </Widget> },
    { id: "recent", label: "Recent workouts", content: <Widget title="Recent workouts" link="/training" action="Training">
      {completed.length ? <ul className="divide-y">{completed.slice(0, 4).map((record) => <li key={record.id}>
        <Link href={`/training/live/${record.id}`} className="flex min-h-11 items-center gap-2 rounded text-sm hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
          <CategoryDot category={record.category} /><span className="min-w-0 flex-1 truncate">{record.title}</span>
          <span className="text-xs text-muted-foreground">{record.durationMinutes ?? 0} min</span>
        </Link>
      </li>)}</ul> : <Empty>Completed mobility, strength and other workouts appear here.</Empty>}
    </Widget> },
    { id: "records", label: "Personal records", content: <Widget title="Personal records" link="/progress" action="Records">
      {records.length ? <ul className="divide-y">{records.map((record) => <li key={record.name} className="flex justify-between gap-2 py-2 text-sm">
        <span>{record.name}</span><span className="font-medium tabular-nums">{record.heaviestKg !== null
          ? `${(weightUnit === "kg" ? record.heaviestKg : record.heaviestKg * 2.20462262185).toLocaleString(undefined, { maximumFractionDigits: 1 })} ${weightUnit}`
          : `${record.longestHoldSeconds} s`}</span>
      </li>)}</ul> : <Empty>Log completed working sets or timed holds to build your records.</Empty>}
    </Widget> },
    { id: "goals", label: "Training goals", content: <Widget title="Training goals" link="/progress" action="Goals">
      {goals.isError ? <Empty>Goals could not be loaded.</Empty> : goals.data?.length ? <ul className="divide-y">{goals.data.slice(0, 4).map(({ id, data }) => {
        const benchmark = benchmarks.data?.find((item) => item.id === data.benchmarkId)?.data
        const value = weeklyGoalProgress(data, samples, checkIns, start, end, benchmark, (benchmarkResults.data ?? []).map(({ data }) => data))
        return <li key={id} className="flex justify-between gap-2 py-2 text-sm">
          <span>{data.name ?? goalMetrics[data.metric]}</span>
          <span className="font-medium tabular-nums">{value.value ?? "—"} / {data.target}</span>
        </li>
      })}</ul> : <Empty>Set a mat, workout, mobility or recovery goal.</Empty>}
    </Widget> },
    { id: "competition", label: "Competitions", content: <Widget title="Competitions" link="/competitions" action="Plan">
      {competitions.isError ? <Empty>Competitions could not be loaded.</Empty> : upcomingEvents.length ? <ul className="divide-y">{upcomingEvents.map(({ id, data }) => <li key={id} className="flex justify-between gap-2 py-2 text-sm"><span>{data.name}</span><span className="text-muted-foreground">{formatCalendarDate(data.date, { month: "short", day: "numeric" })}</span></li>)}</ul> : <Empty>No upcoming competitions.</Empty>}
    </Widget> },
    { id: "belt", label: "Belt progression", content: <Widget title="Belt progression" link="/achievements" action="Progress">
      <p className="text-xl font-semibold capitalize">{profile.data?.belt ?? "White"} belt</p>
      <Empty>{profile.data?.stripes ?? 0} stripes{profile.data?.currentBeltDate ? ` · since ${formatCalendarDate(profile.data.currentBeltDate, { month: "short", year: "numeric" })}` : ""}</Empty>
    </Widget> },
  ]

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile.data?.belt} name={profile.data?.user?.name ?? undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-24 lg:pb-8">
        <PageHeader title="Training dashboard" subtitle={formatCalendarDate(today, { weekday: "long", month: "long", day: "numeric" })} actions={
          <Button asChild variant="ghost" size="icon"><Link href="/settings" aria-label="Training settings"><Settings /></Link></Button>
        } />
        <div className="mx-auto max-w-[96rem] space-y-5 px-4 py-5 sm:px-6">
          {(journal.isError || activities.isError || workouts.isError || prefs.isError || profile.isError) && (
            <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-destructive/50 px-3 py-2 text-sm">
              Some training data could not be loaded.
              <Button variant="outline" size="sm" onClick={() => { for (const result of [journal, activities, workouts, prefs, profile]) if (result.isError) void result.refetch() }}>Retry</Button>
            </div>
          )}
          {due.length > 0 && <div className="rounded-xl border border-primary/30 bg-primary/5 px-4 py-2" role="status">
            <p className="text-sm font-semibold">Session reminders</p><ScheduleList items={due} />
          </div>}
          <div className="grid gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
            <section className="rounded-xl border bg-card p-4">
              <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                <h2 className="text-base font-semibold">Today’s training</h2>
                <div className="flex flex-wrap gap-1">
                  <Button asChild variant="ghost" size="sm"><Link href="/calendar">Open planner <ArrowRight /></Link></Button>
                  <Button asChild size="sm"><Link href="/start-training">Log mat session</Link></Button>
                </div>
              </div>
              {todayPlan.length ? <><ScheduleList items={todayPlan} /><ul className="mt-2 flex flex-wrap gap-2">
                {Object.entries(todayPlan.reduce<Record<string, number>>((totals, { record }) => {
                  const label = activityStatusLabels[record.data.status]
                  totals[label] = (totals[label] ?? 0) + 1
                  return totals
                }, {})).map(([label, count]) => <li key={label} className="rounded bg-muted px-2 py-1 text-xs text-muted-foreground">{count} {label.toLowerCase()}</li>)}
              </ul></> : <Empty>No activities scheduled today.</Empty>}
            </section>
            <section className="rounded-xl border bg-card p-4">
              <h2 className="text-base font-semibold">This week</h2>
              <dl className="mt-2 grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border">
                {weeklyMetrics.map(({ name, value, unit }) => <div key={name} className="bg-card px-3 py-2">
                  <dt className="text-sm text-muted-foreground">{name}</dt>
                  <dd className="text-2xl font-semibold tabular-nums">{value} <span className="text-xs font-normal text-muted-foreground">{unit}</span></dd>
                </div>)}
              </dl>
            </section>
          </div>
          <DashboardWidgets widgets={widgets} preferences={userPreferences.find(({ data }) => data.key === "dashboard")} />
          <DashboardStats totalSessions={entries.length} currentMonthSessions={currentMonthSessions} currentStreak={currentStreak} monthlyGoal={profile.data?.monthlyGoal ?? 12} />
          <div className="grid gap-4 lg:grid-cols-2">
            <RecentEntries entries={entries.slice(0, 3)} />
            <MonthlyChart data={monthlyData} />
          </div>
        </div>
      </main>
    </div>
  )
}
