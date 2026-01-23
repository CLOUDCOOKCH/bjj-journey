import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import { AppNav } from "@/components/app-nav"
import { DashboardStats } from "@/components/dashboard-stats"
import { RecentEntries } from "@/components/recent-entries"
import { MonthlyChart } from "@/components/monthly-chart"
import { QuickEntryButton } from "@/components/quick-entry-button"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Get cookies to pass to API routes
  const cookieStore = await cookies()
  const cookieHeader = Array.from(cookieStore.getAll())
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')

  // Fetch data from API routes
  const [profileRes, entriesRes, achievementsRes] = await Promise.all([
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/profiles`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    }),
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/journal-entries`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    }),
    fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/achievements`, {
      cache: 'no-store',
      headers: {
        cookie: cookieHeader,
      },
    }),
  ])

  if (!profileRes.ok || !entriesRes.ok || !achievementsRes.ok) {
    throw new Error('Failed to fetch data')
  }

  const [profile, entries, achievements] = await Promise.all([
    profileRes.json(),
    entriesRes.json(),
    achievementsRes.json(),
  ])

  // Get recent entries (limit 5)
  const recentEntries = entries.slice(0, 5)

  // Calculate statistics
  const totalSessions = entries?.length || 0

  // Current month sessions
  const now = new Date()
  const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const currentMonthSessions = entries?.filter((e: any) => new Date(e.entryDate) >= currentMonthStart).length || 0

  // Last 6 months data for chart
  const monthlyData = []
  for (let i = 5; i >= 0; i--) {
    const date = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const monthStart = new Date(date.getFullYear(), date.getMonth(), 1)
    const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0)

    const count =
      entries?.filter((e: any) => {
        const entryDate = new Date(e.entryDate)
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
      (a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime(),
    )
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let checkDate = new Date(today)
    for (const entry of sortedEntries) {
      const entryDate = new Date(entry.entryDate)
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
