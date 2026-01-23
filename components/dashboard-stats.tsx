"use client"

import { Card } from "@/components/ui/card"
import { Calendar, TrendingUp, Flame, Award, Target } from "lucide-react"

interface DashboardStatsProps {
  totalSessions: number
  currentMonthSessions: number
  currentStreak: number
  belt: string
  achievementsCount: number
  monthlyGoal?: number
}

export function DashboardStats({
  totalSessions,
  currentMonthSessions,
  currentStreak,
  belt,
  achievementsCount,
  monthlyGoal = 12,
}: DashboardStatsProps) {
  const goalProgress = monthlyGoal > 0 ? (currentMonthSessions / monthlyGoal) * 100 : 0
  const isGoalMet = currentMonthSessions >= monthlyGoal

  const stats = [
    {
      label: "Total Sessions",
      value: totalSessions,
      icon: Calendar,
      color: "text-blue-400",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
    {
      label: "This Month",
      value: currentMonthSessions,
      icon: TrendingUp,
      color: "text-emerald-400",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-500/10",
      borderColor: "border-orange-500/20",
    },
    {
      label: "Achievements",
      value: achievementsCount,
      icon: Award,
      color: "text-purple-400",
      bgColor: "bg-purple-500/10",
      borderColor: "border-purple-500/20",
    },
  ]

  const beltColors: Record<string, string> = {
    white: "bg-zinc-100",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    brown: "bg-amber-800",
    black: "bg-zinc-900 border-zinc-700",
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className={`border-border/50 bg-card/40 backdrop-blur-md p-6 hover:scale-105 transition-all duration-300 hover:shadow-lg hover:shadow-primary/5 hover:border-primary/20`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1 font-medium">{stat.label}</p>
                  <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-xl border ${stat.borderColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <Card className="border-border/50 bg-card/40 backdrop-blur-md p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`${isGoalMet ? "bg-emerald-500/10 border-emerald-500/20" : "bg-primary/10 border-primary/20"} p-3 rounded-xl border`}>
                <Target className={`h-6 w-6 ${isGoalMet ? "text-emerald-400" : "text-primary"}`} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground font-medium">Monthly Goal Progress</p>
                <p className="text-xl font-bold text-foreground">
                  {currentMonthSessions} / {monthlyGoal} sessions
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Progress</span>
                <span className={`font-semibold ${isGoalMet ? "text-emerald-400" : "text-primary"}`}>
                  {Math.min(goalProgress, 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-secondary/50 rounded-full overflow-hidden">
                <div
                  className={`h-full ${isGoalMet ? "bg-emerald-500" : "bg-primary"
                    } rounded-full transition-all duration-1000 ease-out`}
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
              {isGoalMet && (
                <p className="text-sm text-emerald-400 font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
                  Goal achieved! Keep up the great work!
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-border/50 bg-card/40 backdrop-blur-md p-6">
          <div className="flex items-center gap-4">
            <div className={`w-20 h-10 ${beltColors[belt] || beltColors.white} rounded-lg shadow-md ring-1 ring-white/10`} />
            <div>
              <p className="text-sm text-muted-foreground font-medium">Current Belt</p>
              <p className="text-xl font-bold text-foreground capitalize">{belt} Belt</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
