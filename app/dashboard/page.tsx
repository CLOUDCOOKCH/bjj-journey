"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { AppNav } from "@/components/app-nav"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEntries } from "@/components/recent-entries"
import { MonthlyChart } from "@/components/monthly-chart"
import { QuickEntryButton } from "@/components/quick-entry-button"
import { useProfile, useJournalEntries, useAchievements } from "@/lib/hooks"
import { isDateOnOrAfter, isDateBetween, compareDates, formatDateToYYYYMMDD } from "@/lib/utils/date"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  // Always call hooks at the top level (Rules of Hooks)
  const userId = session?.user?.id
  const isAuthenticated = status === 'authenticated'
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)
  const { data: entries = [], isLoading: entriesLoading } = useJournalEntries(isAuthenticated)
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements(isAuthenticated)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AppNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!userId) {
    redirect("/auth/login")
  }

  // Show loading state while fetching
  if (profileLoading || entriesLoading || achievementsLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <AppNav />
        <main className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-slate-400">Loading...</p>
          </div>
        </main>
      </div>
    )
  }

  // Get recent entries (limit 5)
  const recentEntries = entries.slice(0, 5)

  // Calculate statistics
  const totalSessions = entries?.length || 0

  // Current month sessions
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthSessions = entries?.filter((e) => isDateOnOrAfter(e.entryDate, currentMonthStart)).length || 0

  // Last 6 months data for chart
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const count =
      entries?.filter((e) => {
        return isDateBetween(e.entryDate, monthStart, monthEnd)
      }).length || 0

    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      sessions: count,
    })
  }

  // Calculate streak
  let currentStreak = 0
  if (entries && entries.length > 0) {
    const sortedEntries = [...entries].sort((a, b) => b.entryDate.localeCompare(a.entryDate))
    const todayStr = formatDateToYYYYMMDD(new Date())

    let checkDate = new Date(todayStr)

    for (const entry of sortedEntries) {
      const diffDays = compareDates(todayStr, entry.entryDate)

      if (diffDays <= currentStreak) {
        currentStreak++
      } else {
        break
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <AppNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-foreground mb-2">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back! Here&apos;s your training overview</p>
          </div>
          <QuickEntryButton userId={userId} />
        </div>

        <DashboardStats
          totalSessions={totalSessions}
          currentMonthSessions={currentMonthSessions}
          currentStreak={currentStreak}
          belt={profile?.belt || "white"}
          achievementsCount={achievements?.length || 0}
          monthlyGoal={profile?.monthlyGoal || 12}
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <MonthlyChart data={monthlyData} />
          <RecentEntries entries={recentEntries || []} />
        </div>
      </main>
    </div>
  )
}
