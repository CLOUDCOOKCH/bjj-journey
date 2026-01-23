"use client"

import { useState } from "react"
import { redirect, useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import CalendarView from "@/components/calendar-view"
import { CalendarSidebar } from "@/components/calendar-sidebar"
import { CalendarHeader } from "@/components/calendar-header"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { useJournalEntries, useProfile } from "@/lib/hooks"
import { CalendarSkeleton } from "@/components/loading/page-skeleton"

export default function CalendarPage() {
  const router = useRouter()
  const { data: session, status } = useSession()

  const userId = session?.user?.id
  const isAuthenticated = status === 'authenticated'
  const { data: entries = [], isLoading: entriesLoading } = useJournalEntries(isAuthenticated)
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)

  if (status === "loading") {
    return <CalendarSkeleton />
  }

  if (!userId) {
    redirect("/auth/login")
  }

  if (entriesLoading || profileLoading) {
    return <CalendarSkeleton belt={profile?.belt} />
  }

  const monthlyGoal = profile?.monthlyGoal || 12

  const handleAddPastSession = () => {
    router.push("/start-training")
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} name={profile?.user?.name || undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <CalendarHeader currentDate={new Date()} userName={session?.user?.name?.split(" ")[0]} />
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <CalendarView entries={entries || []} userId={userId} onAddPastSession={handleAddPastSession} />
            </div>
            <div className="lg:col-span-1">
              <CalendarSidebar
                entries={entries || []}
                monthlyGoal={monthlyGoal}
                onAddPastSession={handleAddPastSession}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
