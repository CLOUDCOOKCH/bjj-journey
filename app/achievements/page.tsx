"use client"

import { useState } from "react"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { BeltProgressionPath } from "@/components/progress/belt-progression-path"
import { BeltStatsCard } from "@/components/progress/belt-stats-card"
import { AchievementTimeline } from "@/components/progress/achievement-timeline"
import { NextRankRequirements } from "@/components/progress/next-rank-requirements"
import { AchievementDialog } from "@/components/progress/achievement-dialog"
import { DeleteConfirmationDialog } from "@/components/progress/delete-confirmation-dialog"
import { useProfile, useJournalEntries, useAchievements, useProgressStats, useDeleteAchievement, achievementKeys } from "@/lib/hooks"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"

function LoadingState() {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
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

export default function AchievementsPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [achievementToDelete, setAchievementToDelete] = useState<string | null>(null)

  // Fetch all data in parallel
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)
  const { data: entries = [], isLoading: entriesLoading } = useJournalEntries(isAuthenticated)
  const { data: achievements = [], isLoading: achievementsLoading } = useAchievements(isAuthenticated)

  // Calculate progress stats from fetched data
  const { data: progressStats, isLoading: progressLoading } = useProgressStats(
    profile,
    entries,
    achievements,
    isAuthenticated
  )

  const queryClient = useQueryClient()
  const deleteAchievement = useDeleteAchievement({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
    },
  })

  // Initial loading state
  if (status === "loading" || profileLoading || entriesLoading || achievementsLoading || progressLoading) {
    return <LoadingState />
  }

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const handleDeleteClick = (id: string) => {
    setAchievementToDelete(id)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!achievementToDelete) return

    try {
      await deleteAchievement.mutateAsync(achievementToDelete)
      setDeleteDialogOpen(false)
      setAchievementToDelete(null)
    } catch (error) {
      console.error("Error deleting achievement:", error)
      alert(error instanceof Error ? error.message : "Failed to delete achievement. Please try again.")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-8 py-6 lg:py-8 space-y-6 lg:space-y-8">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between bg-background/80 backdrop-blur-md border-b border-border/50">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground">Progress Tracking</h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                Your journey from White to Black Belt
              </p>
            </div>
            <Button
              onClick={() => setIsDialogOpen(true)}
              size="sm"
              className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Achievement
            </Button>
          </header>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column (2/3 width) */}
            <div className="lg:col-span-2 space-y-6 lg:space-y-8">
              {/* Visual Belt Progression Path */}
              <BeltProgressionPath
                currentBelt={profile?.belt || 'white'}
                currentStripes={profile?.stripes || 0}
                achievements={achievements}
              />

              {/* Achievement Timeline */}
              <AchievementTimeline
                achievements={achievements}
                onDelete={handleDeleteClick}
              />
            </div>

            {/* Right Column (1/3 width) */}
            <div className="space-y-6 lg:space-y-8">
              {/* Current Belt Stats */}
              {progressStats && (
                <BeltStatsCard stats={progressStats} />
              )}

              {/* Next Rank Requirements */}
              <NextRankRequirements
                currentBelt={profile?.belt || 'white'}
                currentStripes={profile?.stripes || 0}
                sessionsSincePromotion={progressStats?.sessionsSincePromotion || 0}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Achievement Dialog */}
      {session?.user?.id && (
        <AchievementDialog
          isOpen={isDialogOpen}
          onClose={() => setIsDialogOpen(false)}
          userId={session.user.id}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        isOpen={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false)
          setAchievementToDelete(null)
        }}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  )
}
