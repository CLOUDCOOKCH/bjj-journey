import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEntries } from "@/components/recent-entries"
import { MonthlyChart } from "@/components/monthly-chart"
import { QuickEntryButton } from "@/components/quick-entry-button"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  // Fetch all journal entries
  const { data: entries } = await supabase
    .from("journal_entries")
    .select("id, entry_date, notes")
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })

  // Fetch recent entries with techniques
  const { data: recentEntries } = await supabase
    .from("journal_entries")
    .select(
      `
      id,
      entry_date,
      notes,
      techniques (
        id,
        name,
        youtube_url
      )
    `,
    )
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })
    .limit(5)

  // Fetch achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("achieved_date", { ascending: false })

  // Calculate statistics
  const totalSessions = entries?.length || 0

  // Current month sessions
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthSessions = entries?.filter((e) => new Date(e.entry_date) >= currentMonthStart).length || 0

  // Last 6 months data for chart
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const count =
      entries?.filter((e) => {
        const entryDate = new Date(e.entry_date)
        return entryDate >= monthStart && entryDate <= monthEnd
      }).length || 0

    monthlyData.push({
      month: date.toLocaleDateString("en-US", { month: "short" }),
      sessions: count,
    })
  }

  // Calculate streak
  let currentStreak = 0
  if (entries && entries.length > 0) {
    const sortedEntries = [...entries].sort(
      (a, b) => new Date(b.entry_date).getTime() - new Date(a.entry_date).getTime(),
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let checkDate = new Date(today)
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.entry_date)
      entryDate.setHours(0, 0, 0, 0)

      const diffDays = Math.floor((checkDate.getTime() - entryDate.getTime()) / (1000 * 60 * 60 * 24))

      if (diffDays <= 1) {
        currentStreak++
        checkDate = new Date(entryDate)
        checkDate.setDate(checkDate.getDate() - 1)
      } else {
        break
      }
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AppNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">Dashboard</h1>
            <p className="text-slate-400">Welcome back! Here&apos;s your training overview</p>
          </div>
          <QuickEntryButton userId={user.id} />
        </div>

        <DashboardStats
          totalSessions={totalSessions}
          currentMonthSessions={currentMonthSessions}
          currentStreak={currentStreak}
          belt={profile?.belt || "white"}
          achievementsCount={achievements?.length || 0}
          monthlyGoal={profile?.monthly_goal || 12}
        />

        <div className="grid lg:grid-cols-2 gap-6 mt-6">
          <MonthlyChart data={monthlyData} />
          <RecentEntries entries={recentEntries || []} />
        </div>
      </main>
    </div>
  )
}
