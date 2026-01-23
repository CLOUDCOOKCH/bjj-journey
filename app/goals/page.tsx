"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { useProfile } from "@/lib/hooks"
import { Target } from "lucide-react"

export default function GoalsPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)

  if (status === "loading") {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <MobileBottomNav />
        <main className="lg:ml-64 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background">
        <SidebarNav />
        <MobileBottomNav />
        <main className="lg:ml-64 pb-20 lg:pb-8">
          <div className="container mx-auto px-4 py-8">
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} name={profile?.user?.name || undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Training Goals</h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                Set and track your progress
              </p>
            </div>
          </header>

          <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Target className="h-10 w-10 text-primary" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-foreground">Goals Coming Soon</h2>
              <p className="text-muted-foreground max-w-md">
                Set training frequency goals, technique mastery targets, and track your progress toward belt promotions.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
