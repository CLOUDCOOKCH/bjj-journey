"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import CalendarView from "@/components/calendar-view"
import { AppNav } from "@/components/app-nav"
import { useJournalEntries } from "@/lib/hooks"

export default function CalendarPage() {
  const { data: session, status } = useSession()

  // Always call hooks at the top level (Rules of Hooks)
  const userId = session?.user?.id
  const { data: entries = [], isLoading } = useJournalEntries()

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

  if (isLoading) {
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
