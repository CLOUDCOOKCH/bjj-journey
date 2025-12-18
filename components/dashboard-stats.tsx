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
      bgColor: "bg-blue-600/20",
    },
    {
      label: "This Month",
      value: currentMonthSessions,
      icon: TrendingUp,
      color: "text-green-400",
      bgColor: "bg-green-600/20",
    },
    {
      label: "Current Streak",
      value: `${currentStreak} days`,
      icon: Flame,
      color: "text-orange-400",
      bgColor: "bg-orange-600/20",
    },
    {
      label: "Achievements",
      value: achievementsCount,
      icon: Award,
      color: "text-purple-400",
      bgColor: "bg-purple-600/20",
    },
  ]

  const beltColors: Record<string, string> = {
    white: "bg-slate-100",
    blue: "bg-blue-600",
    purple: "bg-purple-600",
    brown: "bg-amber-800",
    black: "bg-slate-900",
  }

  return (
    <>
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
        {stats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card
              key={stat.label}
              className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 hover:scale-105 transition-transform duration-200"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </Card>
          )
        })}
      </div>

      <div className="grid sm:grid-cols-2 gap-4 mt-4 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className={`${isGoalMet ? "bg-green-600/20" : "bg-blue-600/20"} p-3 rounded-lg`}>
                <Target className={`h-6 w-6 ${isGoalMet ? "text-green-400" : "text-blue-400"}`} />
              </div>
              <div>
                <p className="text-sm text-slate-400">Monthly Goal Progress</p>
                <p className="text-xl font-bold text-white">
                  {currentMonthSessions} / {monthlyGoal} sessions
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Progress</span>
                <span className={`font-semibold ${isGoalMet ? "text-green-400" : "text-blue-400"}`}>
                  {Math.min(goalProgress, 100).toFixed(0)}%
                </span>
              </div>
              <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    isGoalMet ? "bg-green-500" : "bg-blue-500"
                  } rounded-full transition-all duration-500`}
                  style={{ width: `${Math.min(goalProgress, 100)}%` }}
                />
              </div>
              {isGoalMet && (
                <p className="text-sm text-green-400 font-semibold animate-in fade-in slide-in-from-bottom-2 duration-300">
                  Goal achieved! Keep up the great work!
                </p>
              )}
            </div>
          </div>
        </Card>

        <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6">
          <div className="flex items-center gap-4">
            <div className={`w-16 h-8 ${beltColors[belt] || beltColors.white} rounded border-2 border-slate-700`} />
            <div>
              <p className="text-sm text-slate-400">Current Belt</p>
              <p className="text-xl font-bold text-white capitalize">{belt} Belt</p>
            </div>
          </div>
        </Card>
      </div>
    </>
  )
}
