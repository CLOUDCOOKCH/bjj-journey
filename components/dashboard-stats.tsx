"use client"

import { Card } from "@/components/ui/card"
import { Calendar, TrendingUp, Flame } from "lucide-react"

interface DashboardStatsProps {
  totalSessions: number
  currentMonthSessions: number
  currentStreak: number
  monthlyGoal?: number
}

export function DashboardStats({
  totalSessions,
  currentMonthSessions,
  currentStreak,
  monthlyGoal = 12,
}: DashboardStatsProps) {
  const goalProgress = monthlyGoal > 0 ? (currentMonthSessions / monthlyGoal) * 100 : 0

  // Calculate trend (placeholder - could compare to previous month)
  const trend = "+12%"

  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Calendar,
      trend: trend,
      showProgress: false,
    },
    {
      label: "Monthly Progress",
      value: `${Math.min(goalProgress, 100).toFixed(0)}%`,
      icon: TrendingUp,
      showProgress: true,
      progress: goalProgress,
    },
    {
      label: "Current Streak",
      value: currentStreak,
      icon: Flame,
      suffix: "Days",
      showProgress: false,
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {stats.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card
            key={stat.label}
            className={`
              relative overflow-hidden p-6 rounded-2xl
              bg-card/40 backdrop-blur-md border-border/50
              hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/5
              transition-all duration-300 ease-out
              group animate-in fade-in slide-in-from-bottom-4 duration-700
            `}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            {/* Large background icon with opacity */}
            <div className="absolute -right-2 -top-2 opacity-5">
              <Icon className="text-8xl" />
            </div>

            {/* Hover gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-primary/0 via-primary/5 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative flex flex-col gap-2">
              <span className="text-muted-foreground text-xs font-semibold uppercase tracking-widest">
                {stat.label}
              </span>

              {stat.showProgress ? (
                // Monthly Progress with progress bar
                <div className="space-y-3 mt-1">
                  <div className="flex items-center gap-3">
                    <span className="text-4xl font-bold text-foreground">{stat.value}</span>
                  </div>
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full shadow-[0_0_10px_rgba(45,212,191,0.5)] transition-all duration-1000 ease-out"
                      style={{ width: `${Math.min(stat.progress || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                // Regular stat with optional trend and suffix
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-4xl font-bold text-foreground">{stat.value}</span>
                  {stat.suffix && <span className="text-muted-foreground text-sm">{stat.suffix}</span>}
                  {stat.trend && (
                    <span className="text-primary text-xs font-medium flex items-center gap-0.5">
                      <TrendingUp className="w-3 h-3" />
                      {stat.trend}
                    </span>
                  )}
                </div>
              )}
            </div>
          </Card>
        )
      })}
    </div>
  )
}
