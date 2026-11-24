"use client"

import { useState } from "react"
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  activityLabels,
  addCalendarDays,
  addCalendarMonths,
  calendarDays,
  firstDayOfWeek,
  formatCalendarDate,
  type ActivityCategory,
} from "@/lib/training/planner"

export const categoryColors: Record<ActivityCategory, string> = {
  bjj_gi: "bg-blue-600 dark:bg-blue-400",
  bjj_no_gi: "bg-indigo-600 dark:bg-indigo-400",
  open_mat: "bg-teal-600 dark:bg-teal-400",
  strength: "bg-violet-600 dark:bg-violet-400",
  mobility: "bg-emerald-600 dark:bg-emerald-400",
  conditioning: "bg-orange-600 dark:bg-orange-400",
  solo: "bg-fuchsia-600 dark:bg-fuchsia-400",
  recovery: "bg-cyan-600 dark:bg-cyan-400",
  rest: "bg-slate-500 dark:bg-slate-400",
  competition: "bg-rose-600 dark:bg-rose-400",
  private_lesson: "bg-amber-600 dark:bg-amber-400",
}

export function CategoryDot({ category }: { category: ActivityCategory }) {
  return <span className={cn("size-2 shrink-0 rounded-full", categoryColors[category])} aria-hidden="true" />
}

type View = "day" | "week" | "month"

interface CalendarItem {
  id: string
  title: string
  category: ActivityCategory
  movable: boolean
  select: () => void
}

interface Props {
  date: string
  today: string
  defaultView?: View
  onDateChange: (date: string) => void
  onAdd: () => void
  onMove: (id: string, date: string) => void
  items: Map<string, CalendarItem[]>
  editForm?: React.ReactNode
  agenda: React.ReactNode
}

const viewLabels: Record<View, string> = { day: "Day", week: "Week", month: "Month" }

export default function CalendarView({ date, today, defaultView = "week", onDateChange, onAdd, onMove, items, editForm, agenda }: Props) {
  const [view, setView] = useState(defaultView)
  const month = date.slice(0, 7)
  const monthStart = `${month}-01`
  const first = view === "month" ? firstDayOfWeek(monthStart) : firstDayOfWeek(date)
  const last = view === "month" ? addCalendarDays(firstDayOfWeek(addCalendarDays(addCalendarMonths(date, 1), -1)), 6) : addCalendarDays(first, 6)
  const visibleDays = calendarDays(first, last)
  const title = view === "day"
    ? formatCalendarDate(date, { weekday: "long", month: "long", day: "numeric" })
    : view === "week"
      ? `${formatCalendarDate(first, { month: "short", day: "numeric" })} – ${formatCalendarDate(last, { month: "short", day: "numeric", year: "numeric" })}`
      : formatCalendarDate(date, { month: "long", year: "numeric" })
  const changePeriod = (direction: number) => onDateChange(
    view === "month" ? addCalendarMonths(date, direction) : addCalendarDays(date, direction * (view === "week" ? 7 : 1)),
  )

  return (
    <section className="min-w-0 overflow-hidden rounded-xl border bg-card" aria-label="Training schedule">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="flex flex-wrap items-center gap-1">
          <Button variant="ghost" size="icon" onClick={() => changePeriod(-1)} aria-label={`Previous ${view}`}><ChevronLeft /></Button>
          <Button variant="ghost" size="icon" onClick={() => changePeriod(1)} aria-label={`Next ${view}`}><ChevronRight /></Button>
          <h2 className="pl-1 text-base font-semibold tracking-tight sm:text-lg">{title}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" onClick={() => onDateChange(today)}><CalendarDays /> Today</Button>
          <div className="inline-flex rounded-lg border bg-background p-0.5" aria-label="Calendar view" role="group">
            {(Object.keys(viewLabels) as View[]).map((value) => (
              <Button key={value} size="sm" variant={value === view ? "secondary" : "ghost"} aria-pressed={value === view} onClick={() => setView(value)}>
                {viewLabels[value]}
              </Button>
            ))}
          </div>
          <Button onClick={onAdd}><Plus /> Schedule</Button>
        </div>
      </div>
      {editForm}
      {view !== "day" && (
        <div className="overflow-x-auto border-b">
          <div className="grid min-w-[19.25rem] grid-cols-7" role="group" aria-label={view === "week" ? "Week dates" : "Month dates"}>
          {visibleDays.map((day, index) => {
            const dayItems = items.get(day) ?? []
            const selected = day === date
            return (
              <div key={day} className={cn(
                "min-w-0 border-b border-r border-border/70 last:border-r-0",
                selected && "bg-primary/8",
                view === "month" && day.slice(0, 7) !== month && "bg-muted/40",
              )} onDragOver={(event) => event.preventDefault()} onDrop={(event) => {
                event.preventDefault()
                const id = event.dataTransfer.getData("application/x-bjj-activity")
                if (id) onMove(id, day)
              }}>
                {index < 7 && <p className="px-1 pt-2 text-center text-[0.65rem] font-medium text-muted-foreground sm:pl-2 sm:text-left sm:text-xs">{formatCalendarDate(day, { weekday: "short" })}</p>}
                <button type="button" onClick={() => onDateChange(day)} aria-pressed={selected} aria-current={day === today ? "date" : undefined}
                  aria-label={`${formatCalendarDate(day, { dateStyle: "full" })}, ${dayItems.length} ${dayItems.length === 1 ? "activity" : "activities"}`}
                  className="flex min-h-11 w-full items-center justify-center gap-1 rounded-sm px-1 text-sm font-semibold hover:bg-accent/15 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring sm:justify-start sm:px-2">
                  <span className={cn("flex size-6 items-center justify-center rounded-full tabular-nums", day === today && "bg-primary text-primary-foreground")}>{Number(day.slice(-2))}</span>
                  {dayItems.length > 0 && <span className="text-[0.65rem] text-muted-foreground sm:hidden" aria-hidden="true">{dayItems.length}</span>}
                </button>
                {dayItems.length > 0 && (
                  <ul className="hidden min-h-8 space-y-1 px-1 pb-2 md:block">
                    {dayItems.slice(0, view === "month" ? 2 : 5).map((item) => (
                      <li key={item.id}>
                        <button type="button" title={`${activityLabels[item.category]} · ${item.title}`} draggable={item.movable} onDragStart={(event) => {
                          event.dataTransfer.effectAllowed = "move"
                          event.dataTransfer.setData("application/x-bjj-activity", item.id)
                        }} onClick={() => { onDateChange(day); item.select() }}
                          className="flex w-full min-w-0 items-center gap-1.5 rounded px-1.5 py-1 text-left text-xs hover:bg-accent/15 focus-visible:outline-2 focus-visible:outline-ring">
                          <CategoryDot category={item.category} /><span className="truncate">{item.title}</span>
                        </button>
                      </li>
                    ))}
                    {dayItems.length > (view === "month" ? 2 : 5) && <li className="px-1 text-xs text-muted-foreground">+{dayItems.length - (view === "month" ? 2 : 5)} more</li>}
                  </ul>
                )}
              </div>
            )
          })}
          </div>
        </div>
      )}
      {agenda}
    </section>
  )
}
