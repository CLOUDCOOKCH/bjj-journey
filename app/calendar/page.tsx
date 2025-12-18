import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CalendarView from "@/components/calendar-view"
import { AppNav } from "@/components/app-nav"

export default async function CalendarPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch journal entries for the current user
  const { data: entries, error } = await supabase
    .from("journal_entries")
    .select(
      `
      id,
      entry_date,
      notes,
      techniques (
        id,
        name,
        youtube_url,
        notes
      )
    `,
    )
    .eq("user_id", user.id)
    .order("entry_date", { ascending: false })

  if (error) {
    console.error("Error fetching entries:", error)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AppNav />
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold text-white mb-2">Training Calendar</h1>
          <p className="text-slate-400">Track your training sessions and review your progress</p>
        </div>
        <CalendarView entries={entries || []} userId={user.id} />
      </main>
    </div>
  )
}
