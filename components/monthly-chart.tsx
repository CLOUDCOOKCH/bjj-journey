interface MonthlyChartProps {
  data: { month: string; sessions: number }[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const maxSessions = Math.max(...data.map(({ sessions }) => sessions), 1)
  return (
    <section className="min-w-0 rounded-xl border bg-card p-4" aria-labelledby="monthly-chart-title">
      <h2 id="monthly-chart-title" className="font-semibold">Mat sessions by month</h2>
      {data.some(({ sessions }) => sessions > 0)
        ? <ul className="mt-4 grid grid-cols-6 gap-1.5 sm:gap-2">
          {data.map(({ month, sessions }, index) => (
            <li key={month} className="flex min-w-0 flex-col items-center gap-1 text-xs tabular-nums">
              <span className="font-semibold">{sessions}</span>
              <span className="flex h-24 w-full items-end rounded bg-muted/40" aria-hidden="true">
                <span className={`w-full rounded-t ${index === data.length - 1 ? "bg-primary" : "bg-primary/55"}`} style={{ height: `${100 * sessions / maxSessions}%` }} />
              </span>
              <span className="truncate text-muted-foreground">{month}</span>
            </li>
          ))}
        </ul>
        : <p className="mt-2 text-sm text-muted-foreground">Log mat sessions to see your monthly training history.</p>}
    </section>
  )
}
