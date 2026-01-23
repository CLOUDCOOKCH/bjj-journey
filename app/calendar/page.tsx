import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import CalendarView from "@/components/calendar-view"
import { AppNav } from "@/components/app-nav"

export default async function CalendarPage() {
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

  // Fetch journal entries from API
  const entriesRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/journal-entries`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  })

  if (!entriesRes.ok) {
    throw new Error('Failed to fetch entries')
  }

  const entries = await entriesRes.json()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AppNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold text-white mb-2">Training Calendar</h1>
          <p className="text-slate-400">Track your training sessions and review your progress</p>
        </div>
        <CalendarView entries={entries || []} userId={userId} />
      </main>
    </div>
  )
}
