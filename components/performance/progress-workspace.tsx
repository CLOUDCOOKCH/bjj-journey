'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChartNoAxesCombined, Medal, Target, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { getOccurrences } from '@/lib/training/planner'
import { useCalendarJournalEntries } from '@/lib/training/planner-client'
import { fromKilograms } from '@/lib/training/workouts'
import {
  addTrainingDays, fitnessMilestones, getLocalTrainingDate, startOfTrainingWeek, strengthRecords,
  trainingLoad, type TrainingSample,
} from '@/lib/training/performance'
import { formatDateString } from '@/lib/utils/date'
import { LoadError } from './performance-shell'
import { usePerformanceRecords } from './training-records'
import { BenchmarksPanel, GoalsPanel } from './benchmarks-goals'
import { MetricTrend } from './metric-trend'

const number = new Intl.NumberFormat('en', { maximumFractionDigits: 1 })

const categoryLabels: Record<TrainingSample['category'], string> = {
  bjj: 'BJJ', strength: 'Strength', conditioning: 'Conditioning', mobility: 'Mobility', solo: 'Solo drills', recovery: 'Recovery',
}

function LoadPanel({ samples, scheduledRestDays, today }: {
  samples: TrainingSample[]
  scheduledRestDays: string[]
  today: string
}) {
  const [range, setRange] = useState<7 | 28>(7)
  const from = addTrainingDays(today, 1 - range)
  const period = trainingLoad(samples, from, today)
  const weekStart = startOfTrainingWeek(today)
  const week = trainingLoad(samples, weekStart, today)
  const restDayCount = new Set(scheduledRestDays.filter((date) => date >= from && date <= today)).size
  const previous = trainingLoad(samples, addTrainingDays(from, -range), addTrainingDays(from, -1))
  const changes = period.measuredSessions >= 3 && previous.measuredSessions >= 3 && previous.load > 0
    ? 100 * (period.load - previous.load) / previous.load
    : null
  const hasTrend = changes !== null && Math.abs(changes) >= 30
  const minutes = Object.values(period.byCategory).reduce((sum, value) => sum + value, 0)
  const previousMinutes = Object.values(previous.byCategory).reduce((sum, value) => sum + value, 0)
  const dates = Array.from({ length: range }, (_, index) => addTrainingDays(from, index))
  const maxLoad = Math.max(1, ...period.daily.values())

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2"><ChartNoAxesCombined className="size-5 text-primary" /> Training load</CardTitle>
          <CardDescription>Completed minutes × recorded session RPE (0–10).</CardDescription>
        </div>
        <div aria-label="Load date range" role="group" className="flex gap-1 rounded-lg bg-muted p-1">
          {([7, 28] as const).map((days) => (
            <Button key={days} type="button" variant={days === range ? 'default' : 'ghost'} aria-pressed={range === days} onClick={() => setRange(days)}>{days} days</Button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
          {[
            ['Load in selected period', period.measuredSessions ? number.format(period.load) : '—'],
            ['Load this week', week.measuredSessions ? number.format(week.load) : '—'],
            ['Average session RPE', period.averageRpe === null ? '—' : number.format(period.averageRpe)],
            ['High-intensity days', period.highIntensityDays],
            ['Training days', period.activeDays],
            ['Recovery activity days', period.recoveryDays],
            ['Scheduled rest days', restDayCount],
            ['Sessions with load data', `${period.measuredSessions} / ${period.sessions}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-lg border border-border p-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="mt-1 text-xl font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>
        {hasTrend && (
          <p role="status" className="rounded-lg border border-primary/30 bg-primary/5 p-3 text-sm">
            Recorded load is {number.format(Math.abs(changes))}% {changes > 0 ? 'higher' : 'lower'} than the previous {range} days. Check the activity totals and RPE coverage when interpreting this change.
          </p>
        )}
        {period.measuredSessions > 0 ? (
          <div>
            <div aria-hidden="true" className="flex h-28 items-end gap-1 border-b border-border">
              {dates.map((date) => (
                <div key={date} className="flex-1 rounded-t-sm bg-primary/85" style={{ height: `${(period.daily.get(date) ?? 0) / maxLoad * 100}%` }} title={`${date}: ${period.daily.get(date) ?? 'unrecorded'}`} />
              ))}
            </div>
            <div aria-hidden="true" className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>{formatDateString(from)}</span><span>{formatDateString(today)}</span>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer py-2 text-sm font-medium">Daily values</summary>
              <table className="w-full text-left text-sm">
                <thead><tr><th scope="col">Date</th><th scope="col">Recorded load</th></tr></thead>
                <tbody className="divide-y divide-border">
                  {dates.map((date) => <tr key={date}><th className="py-1.5 font-normal" scope="row">{formatDateString(date)}</th><td>{period.daily.has(date) ? number.format(period.daily.get(date)!) : 'Unrecorded'}</td></tr>)}
                </tbody>
              </table>
            </details>
          </div>
        ) : <p className="text-sm text-muted-foreground">Record session RPE when logging training to see your training load.</p>}
        <div className="space-y-2 border-t border-border pt-4">
          <h3 className="text-sm font-semibold">Completed minutes by activity</h3>
          {previousMinutes > 0 && <p className="text-sm text-muted-foreground">{number.format(minutes)} min recorded · {number.format(previousMinutes)} min in the previous {range} days</p>}
          <div className="flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted-foreground">
            {Object.entries(period.byCategory).map(([category, total]) => <span key={category}>{categoryLabels[category as TrainingSample['category']]} · {number.format(total)} min</span>)}
            {Object.keys(period.byCategory).length === 0 && <span>No timed activities in this date range.</span>}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

type Records = ReturnType<typeof strengthRecords>

function RecordsPanel({ records, weightUnit }: { records: Records; weightUnit: 'kg' | 'lb' }) {
  const formatWeight = (value: number) => number.format(fromKilograms(value, weightUnit))

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Medal className="size-5 text-primary" /> Strength records</CardTitle>
        <CardDescription>Working sets from completed sessions. Estimated one-rep max uses Epley’s formula for sets of 2–10 reps.</CardDescription>
      </CardHeader>
      <CardContent>
        {records.length === 0 ? <div className="space-y-3"><p className="text-sm text-muted-foreground">Complete a strength session to see your records here.</p><Button variant="outline" asChild><Link href="/training/strength">Open strength training</Link></Button></div> : (
          <ul className="divide-y divide-border">
            {records.map((record) => (
              <li key={record.slug} className="py-3">
                <details>
                  <summary className="cursor-pointer rounded-sm py-1 font-medium focus-visible:outline-2 focus-visible:outline-ring">{record.name}</summary>
                  <dl className="mb-3 mt-2 flex flex-wrap gap-x-5 gap-y-2 text-sm">
                    {record.heaviestKg !== null && <div><dt className="text-muted-foreground">Heaviest set</dt><dd>{formatWeight(record.heaviestKg)} {weightUnit}</dd></div>}
                    {record.estimatedOneRepMaxKg !== null && <div><dt className="text-muted-foreground">Estimated 1RM</dt><dd>{formatWeight(record.estimatedOneRepMaxKg)} {weightUnit}</dd></div>}
                    {record.longestHoldSeconds !== null && <div><dt className="text-muted-foreground">Longest hold</dt><dd>{number.format(record.longestHoldSeconds)} s</dd></div>}
                    {record.volumeKg > 0 && <div><dt className="text-muted-foreground">Lifetime volume</dt><dd>{formatWeight(record.volumeKg)} {weightUnit} × reps</dd></div>}
                  </dl>
                  <div className="mb-3">
                    <MetricTrend label={record.name + ' working-set weight'} values={record.sets.slice().sort((a, b) => a.date.localeCompare(b.date)).flatMap((set) => set.weightKg === undefined ? [] : [set.weightKg])} />
                  </div>
                  <p className="mb-1 text-xs text-muted-foreground">Latest 12 working sets</p>
                  <table className="w-full text-left text-sm">
                    <thead className="text-muted-foreground"><tr><th scope="col">Date</th><th scope="col">Weight</th><th scope="col">Reps</th><th scope="col">Hold</th></tr></thead>
                    <tbody className="divide-y divide-border">
                      {record.sets.slice().sort((left, right) => right.date.localeCompare(left.date)).slice(0, 12).map((set, index) => (
                        <tr key={`${set.date}-${index}`}>
                          <th scope="row" className="py-2 font-normal">{formatDateString(set.date)}</th>
                          <td>{set.weightKg === undefined ? '—' : `${formatWeight(set.weightKg)} ${weightUnit}`}</td>
                          <td>{set.repetitions ?? '—'}</td><td>{set.holdSeconds === undefined ? '—' : `${set.holdSeconds} s`}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </details>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export function ProgressWorkspace({ userId }: { userId: string }) {
  const workouts = usePerformanceRecords('workouts', userId).query
  const activities = usePerformanceRecords('activities', userId).query
  const preferences = usePerformanceRecords('preferences', userId).query
  const checkIns = usePerformanceRecords('recovery', userId).query
  const journal = useCalendarJournalEntries()
  const trainingPreference = preferences.data?.find(({ data }) => data.key === 'training')?.data
  const unitsPreference = preferences.data?.find(({ data }) => data.key === 'units')?.data
  const timeZone = trainingPreference?.timeZone ?? Intl.DateTimeFormat().resolvedOptions().timeZone
  const weightUnit = trainingPreference?.weightUnit ?? unitsPreference?.weightUnit ?? 'kg'
  const today = getLocalTrainingDate(new Date(), timeZone)
  const completed = (workouts.data ?? []).filter(({ data }) => data.status === 'completed').map(({ data }) => ({
    ...data,
    date: getLocalTrainingDate(new Date(data.completedAt ?? data.startedAt), timeZone),
  }))
  const samples: TrainingSample[] = [
    ...(journal.data ?? []).map((entry): TrainingSample => ({
      date: entry.entryDate,
      category: 'bjj',
      durationMinutes: entry.durationMinutes,
      sessionRpe: entry.sessionRpe,
    })),
    ...completed.map((workout): TrainingSample => ({
      date: workout.date, category: workout.category, durationMinutes: workout.durationMinutes, sessionRpe: workout.sessionRpe,
    })),
  ]
  const scheduledRestDays = getOccurrences(activities.data ?? [], addTrainingDays(today, -27), today)
    .filter(({ record }) => record.data.category === 'rest' && !['skipped', 'cancelled'].includes(record.data.status))
    .map(({ date }) => date)
  const records = strengthRecords(completed.filter((workout) => workout.category === 'strength'))
  const firstMeasuredStrengthDate = records.flatMap(({ sets }) => sets)
    .filter(({ weightKg, repetitions }) => (weightKg ?? 0) > 0 && (repetitions ?? 0) > 0)
    .map(({ date }) => date).sort().at(0)
  const milestones = fitnessMilestones(samples, firstMeasuredStrengthDate, today)
  const historyQueries = [journal, workouts, activities, preferences]
  const historyPending = historyQueries.some((query) => query.isPending)
  const historyError = historyQueries.some((query) => query.isError)

  return (
    <>
      {historyError ? <LoadError onRetry={() => historyQueries.forEach((query) => { void query.refetch() })}>Could not load your training history.</LoadError> : historyPending ? (
        <p role="status">Loading training history…</p>
      ) : (
        <div className="space-y-6">
          <LoadPanel samples={samples} scheduledRestDays={scheduledRestDays} today={today} />
          <RecordsPanel records={records} weightUnit={weightUnit} />
          <Card id="fitness-milestones" className="scroll-mt-24">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Trophy className="size-5 text-primary" /> Fitness milestones</CardTitle>
              <CardDescription>Earned from completed training. Each milestone appears once.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="grid gap-3 sm:grid-cols-2">
                {milestones.map(({ id, title, detail, earnedDate }) => (
                  <li key={id} className="rounded-xl border border-border p-3">
                    <p className="font-medium">{title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{detail}</p>
                    <p className="mt-2 text-sm font-medium">{earnedDate ? 'Earned ' + formatDateString(earnedDate) : 'In progress'}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      )}
      <BenchmarksPanel userId={userId} today={today} />
      {!historyPending && !historyError && (
        checkIns.isError ? <LoadError onRetry={() => void checkIns.refetch()}>Could not load recovery data for goals.</LoadError>
          : checkIns.isSuccess ? <GoalsPanel userId={userId} samples={samples} checkIns={checkIns.data.map(({ data }) => data)} today={today} />
            : <p role="status">Loading training goals…</p>
      )}
      <div className="flex flex-wrap gap-2">
        <Button asChild variant="outline"><Link href="/achievements"><Trophy aria-hidden="true" /> Belt progression and achievements</Link></Button>
        <Button asChild variant="outline"><Link href="/calendar"><Target aria-hidden="true" /> Training planner</Link></Button>
      </div>
    </>
  )
}
