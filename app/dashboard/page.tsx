"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEntries } from "@/components/recent-entries"
import { MonthlyChart } from "@/components/monthly-chart"
import { QuickActions } from "@/components/quick-actions"
import { AchievementCard } from "@/components/achievement-card"
import { useProfile, useJournalEntries, useAchievements } from "@/lib/hooks"
import { isDateOnOrAfter, isDateBetween, compareDates, formatDateToYYYYMMDD } from "@/lib/utils/date"

export default function DashboardPage() {
  const { data: session, status } = useSession()

  // Always call hooks at the top level (Rules of Hooks)
  const userId = session?.user?.id
  const isAuthenticated = status === "authenticated"
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)
  const { data: entries = [], isLoading: entriesLoading } = useJournalEntries(isAuthenticated)
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements(isAuthenticated)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav belt={profile?.belt} />
        <MobileBottomNav />
        <main className="lg:ml-64 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
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
      <div className="min-h-screen bg-background">
        <SidebarNav belt={profile?.belt} />
        <MobileBottomNav />
        <main className="lg:ml-64 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 lg:px-8 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // Get recent entries (limit 3)
  const recentEntries = entries.slice(0, 3)

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

    for (const entry of sortedEntries) {
      const diffDays = compareDates(todayStr, entry.entryDate)

      if (diffDays <= currentStreak) {
        currentStreak++
      } else {
        break
      }
    }
  }

  // Calculate next achievement
  const getNextAchievement = () => {
    if (!achievements || achievements.length === 0) {
      return {
        title: "First Training Session",
        description: "Complete your first training session to start tracking your journey.",
        sessionsRemaining: 1,
      }
    }

    // Simple logic: next milestone at session milestones
    const milestones = [10, 25, 50, 100, 150, 200, 500]
    const nextMilestone = milestones.find((m) => m > totalSessions)

    if (nextMilestone) {
      return {
        title: `${nextMilestone} Training Sessions`,
        description: `You are ${nextMilestone - totalSessions} sessions away from this milestone.`,
        sessionsRemaining: nextMilestone - totalSessions,
      }
    }

    return {
      title: "Jiu-Jitsu Journey",
      description: "Continue your training and unlock new achievements.",
      sessionsRemaining: 0,
    }
  }

  const nextAchievement = getNextAchievement()

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} name={profile?.user?.name || undefined} />
      <MobileBottomNav />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
          {/* Header */}
          <DashboardHeader userName={session?.user?.name?.split(" ")[0]} />

          {/* Stats Grid - 3 Cards */}
          <DashboardStats
            totalSessions={totalSessions}
            currentMonthSessions={currentMonthSessions}
            currentStreak={currentStreak}
            monthlyGoal={profile?.monthlyGoal || 12}
          />

          {/* Two-Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-8">
              {/* Quick Actions */}
              <QuickActions />

              {/* Recent Activity */}
              <RecentEntries entries={recentEntries || []} />
            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-8">
              {/* Training Volume Chart */}
              <MonthlyChart data={monthlyData} />

              {/* Achievement Card */}
              <AchievementCard nextAchievement={nextAchievement} />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
