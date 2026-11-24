"use client"

import { useState } from "react"
import { BarChart3 } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface MonthlyChartProps {
  data: { month: string; date: string; sessions: number }[]
}

const periods = [3, 6, 12]

export function MonthlyChart({ data }: MonthlyChartProps) {
  const [period, setPeriod] = useState(6)
  const months = data.slice(-period)
  const total = months.reduce((sum, month) => sum + month.sessions, 0)
  const peak = Math.max(0, ...months.map(({ sessions }) => sessions))
  const step = Math.max(1, Math.ceil(peak / 4))
  const ticks = [step * 4, step * 3, step * 2, step, 0]

  return (
    <section className="min-w-0 rounded-2xl border bg-card p-4 sm:p-6" aria-labelledby="monthly-chart-title">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id="monthly-chart-title" className="text-lg font-semibold tracking-tight">Mat activity</h2>
          <p className="mt-1 text-sm text-muted-foreground">Sessions logged by month</p>
        </div>
        <div role="group" aria-label="Mat activity period" className="flex shrink-0 gap-1 rounded-lg border bg-muted/50 p-1">
          {periods.map((range) => (
            <button key={range} type="button" aria-label={`Last ${range} months`} aria-pressed={period === range}
              onClick={() => setPeriod(range)}
              className={cn(
                "min-h-9 min-w-9 rounded-md px-2 text-xs font-medium tabular-nums outline-offset-2 focus-visible:outline-2 focus-visible:outline-ring",
                period === range ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              )}>
              {range}m
            </button>
          ))}
        </div>
      </header>
      {total === 0 ? (
        <div className="mt-5 flex min-h-48 flex-col items-center justify-center gap-3 rounded-xl border border-dashed bg-muted/20 px-4 py-6 text-center">
          <BarChart3 className="size-6 text-muted-foreground" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">No sessions in the last {period} months.</p>
          <Link className="rounded text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-ring"
            href="/start-training">Log a mat session</Link>
        </div>
      ) : (
        <figure className="mt-5">
          <figcaption aria-live="polite" className="mb-5 text-sm text-muted-foreground">
            <strong className="text-xl font-semibold tabular-nums text-foreground">{total}</strong> {total === 1 ? "session" : "sessions"} in the last {period} months
          </figcaption>
          <div className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3">
            <div className="flex h-40 flex-col justify-between text-right text-xs tabular-nums text-muted-foreground sm:h-48" aria-hidden="true">
              {ticks.map(tick => <span key={tick}>{tick}</span>)}
            </div>
            <div className="relative min-w-0">
              <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 flex h-40 flex-col justify-between py-[0.45rem] sm:h-48">
                {ticks.map(tick => <span key={tick} className="border-t border-border/75" />)}
              </div>
              <ul className="relative grid gap-1.5 sm:gap-3" style={{ gridTemplateColumns: `repeat(${months.length}, minmax(0, 1fr))` }}>
                {months.map(({ month, date, sessions }, index) => (
                  <li key={date} className="min-w-0">
                    <Link href={`/calendar?date=${date}&view=month`} aria-label={`${month}, ${sessions} mat ${sessions === 1 ? "session" : "sessions"}. Open calendar`}
                      title={`${month} · ${sessions} ${sessions === 1 ? "session" : "sessions"}`}
                      className="group block rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring">
                      <span aria-hidden="true" className="flex h-40 items-end justify-center py-[0.45rem] sm:h-48">
                        <span className={cn("w-full max-w-12 rounded-t-md transition-colors motion-reduce:transition-none group-hover:bg-primary",
                          index === months.length - 1 ? "bg-primary" : "bg-primary/40")}
                          style={{ height: sessions > 0 ? `${100 * sessions / ticks[0]}%` : "2px" }} />
                      </span>
                      <span aria-hidden="true" className={cn("mt-1 flex justify-center whitespace-nowrap text-xs text-muted-foreground",
                        period === 12 && index !== months.length - 1 && (index % 2 !== 0 || index === months.length - 2) && "invisible sm:visible")}>{month}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </figure>
      )}
    </section>
  )
}
