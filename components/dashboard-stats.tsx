"use client"

import { Calendar, TrendingUp, Flame } from "lucide-react"

interface DashboardStatsProps {
  totalSessions: number
  currentMonthSessions: number
  currentStreak: number
  monthlyGoal?: number
}

export function DashboardStats({ totalSessions, currentMonthSessions, currentStreak, monthlyGoal = 12 }: DashboardStatsProps) {
  return (
    <section className="grid divide-y rounded-xl border bg-card sm:grid-cols-3 sm:divide-x sm:divide-y-0" aria-label="BJJ statistics">
      <div className="px-4 py-4">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Calendar className="size-4" /> Mat sessions</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{totalSessions}</p>
      </div>
      <div className="px-4 py-4">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><TrendingUp className="size-4" /> Monthly session goal</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{currentMonthSessions} <span className="text-sm font-normal text-muted-foreground">/ {monthlyGoal}</span></p>
        <progress className="mt-1 h-1.5 w-full accent-primary" aria-label="Monthly mat sessions" max={monthlyGoal} value={Math.min(monthlyGoal, currentMonthSessions)} />
      </div>
      <div className="px-4 py-4">
        <p className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Flame className="size-4" /> Mat streak</p>
        <p className="mt-1 text-2xl font-semibold tabular-nums">{currentStreak} <span className="text-sm font-normal text-muted-foreground">days</span></p>
      </div>
    </section>
  )
}
