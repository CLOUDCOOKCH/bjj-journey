"use client"

import { useState, useMemo } from "react"
import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { AchievementDialog } from "@/components/progress/achievement-dialog"
import { DeleteConfirmationDialog } from "@/components/progress/delete-confirmation-dialog"
import { useProfile, useJournalEntries, useAchievements, useProgressStats, useDeleteAchievement, achievementKeys } from "@/lib/hooks"
import { parseBeltInfo } from "@/lib/constants/belt-progression"
import { Plus, Bell, Settings, Shield, Check, User, Lock, Award, CheckCircle, Info, Trophy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"
import { cn } from "@/lib/utils"

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

  // Calculate earned stripes based on achievements
  const currentBelt = profile?.belt || 'white'

  const earnedStripes = useMemo(() => {
    if (!achievements.length) return 0

    // Find when the current belt was achieved
    const currentBeltAchievement = achievements.find(a => {
      const info = parseBeltInfo(a.title, 'belt')
      return a.type === 'belt' && info.belt === currentBelt
    })

    const promotionDate = currentBeltAchievement ? new Date(currentBeltAchievement.achievedDate) : null
    const stripeAchievements = achievements.filter(a => a.type === 'stripe')
    let maxStripe = 0

    stripeAchievements.forEach(a => {
      const info = parseBeltInfo(a.title, 'stripe')
      const achievementDate = new Date(a.achievedDate)
      let isForCurrentBelt = false

      if (info.belt) {
        isForCurrentBelt = info.belt === currentBelt
      } else {
        if (promotionDate) {
          isForCurrentBelt = achievementDate >= promotionDate
        } else {
          isForCurrentBelt = true
        }
      }

      if (isForCurrentBelt && info.stripe) {
        maxStripe = Math.max(maxStripe, info.stripe)
      }
    })

    return maxStripe
  }, [achievements, currentBelt])

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

  // Helper to display belt status
  const belts = ['White', 'Blue', 'Purple', 'Brown', 'Black']
  const currentBeltIndex = belts.findIndex(b => b.toLowerCase() === currentBelt.toLowerCase())

  const getBeltDate = (beltName: string) => {
    const achievement = achievements.find(a => {
      const info = parseBeltInfo(a.title, 'belt')
      return a.type === 'belt' && info.belt === beltName.toLowerCase()
    })
    if (!achievement) return null
    return new Date(achievement.achievedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
  }

  // Next stripe progress calculation
  const stripeProgress = (earnedStripes / 4) * 100
  const sessionCount = progressStats?.sessionsSincePromotion || 0
  const estimatedMonths = Math.max(0, Math.ceil((100 - sessionCount) / 12)) // Rough estimate logic

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} name={profile?.user?.name || undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">

        {/* Dynamic Content Area */}
        <div style={{ viewTransitionName: 'main-content' } as React.CSSProperties}>

          {/* Header */}
          <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-8 bg-background/80 backdrop-blur-md border-b border-border/50">
            <div>
              <h1 className="text-xl lg:text-2xl font-bold text-foreground font-heading">Progress Tracking</h1>
              <p className="text-xs lg:text-sm text-muted-foreground font-medium">
                Your path to the Black Belt.
              </p>
            </div>

            <div className="flex items-center gap-4">
              <Button
                onClick={() => setIsDialogOpen(true)}
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20"
              >
                <Plus className="w-4 h-4 mr-2" />
                Add
              </Button>
            </div>
          </header>

          <div className="p-8 space-y-8">

            {/* Visual Belt Progression */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="glass-card p-10 rounded-3xl">
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-2xl font-bold text-foreground font-heading">Belt Progression</h2>
                    <p className="text-sm text-muted-foreground">{entries.length} total sessions logged</p>
                  </div>
                  <div className="px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
                    <span className="text-xs font-bold text-primary uppercase tracking-widest">
                      Rank: {currentBelt} Belt {earnedStripes > 0 ? `${earnedStripes} Stripe${earnedStripes > 1 ? 's' : ''}` : ''}
                    </span>
                  </div>
                </div>

                <div className="relative flex flex-col lg:flex-row items-center w-full pt-6 pb-6 lg:pt-10 lg:pb-20 px-2 lg:px-4 gap-0">
                  {belts.map((belt, index) => {
                    const isCompleted = index < currentBeltIndex
                    const isCurrent = index === currentBeltIndex
                    const date = getBeltDate(belt)

                    let bgColor = "bg-slate-900"
                    if (belt === "White") bgColor = "bg-white"
                    if (belt === "Blue") bgColor = "bg-blue-600"
                    if (belt === "Purple") bgColor = "bg-purple-700"
                    if (belt === "Brown") bgColor = "bg-amber-900" // approximated brown
                    if (belt === "Black") bgColor = "bg-slate-950"

                    return (
                      <div key={belt} className={cn("flex flex-col items-center z-10", index === belts.length - 1 ? "" : "lg:flex-1 lg:flex-row lg:w-auto w-full")}>
                        <div className={cn("relative flex flex-col items-center gap-4 min-w-[80px] z-20", isCurrent && "scale-125")}>
                          <div className={cn(
                            "w-12 h-12 rounded-full border-4 flex items-center justify-center shadow-xl transition-all",
                            bgColor,
                            isCurrent ? "border-primary shadow-[0_0_20px_rgba(45,212,191,0.3)]" : "border-slate-800"
                          )}>
                            {isCompleted ? (
                              <Check className={cn("text-xl font-bold", belt === "White" ? "text-slate-950" : "text-white")} />
                            ) : isCurrent ? (
                              <User className="text-white text-xl font-bold" />
                            ) : (
                              <Lock className="text-slate-400 text-lg relative z-10" />
                            )}
                          </div>

                          <div className={cn(
                            "flex flex-col",
                            isCurrent ? "absolute left-20 top-1/2 -translate-y-1/2 items-start lg:static lg:items-center lg:translate-y-0 lg:left-auto lg:top-auto" : "items-center"
                          )}>
                            <span className={cn(
                              "text-[10px] uppercase tracking-tighter",
                              isCurrent ? "font-black text-primary tracking-widest" : "font-bold text-muted-foreground"
                            )}>
                              {isCurrent ? "Current" : belt}
                            </span>
                            {date && (
                              <span className={cn(
                                "text-[9px] text-muted-foreground whitespace-nowrap font-medium italic",
                                isCurrent ? "static lg:absolute lg:-bottom-8" : "absolute -bottom-6"
                              )}>
                                {date}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Connector (Responsive) */}
                        {index < belts.length - 1 && (
                          <div className="relative w-1 h-16 lg:h-1 lg:w-auto lg:flex-1 bg-slate-800 -my-1 lg:my-0 z-0">
                            <div className={cn(
                              "absolute bg-primary transition-all duration-1000",
                              // Mobile styles (vertical fill)
                              "top-0 left-0 w-full",
                              index < currentBeltIndex ? "h-full" : "h-0",
                              // Desktop styles (horizontal fill)
                              "lg:h-full lg:w-full",
                              index < currentBeltIndex ? "lg:scale-x-100 origin-left" : "lg:scale-x-0 origin-left",
                              // Glow effect
                              index < currentBeltIndex && "shadow-[0_0_10px_rgba(45,212,191,0.5)]"
                            )}></div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            </section>

            {/* Stripe Focus & Requirements */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

              {/* Stripe Tracker */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
                <div className="glass-card p-8 rounded-3xl h-full">
                  <h3 className="text-lg font-bold text-foreground font-heading mb-6">Current Stripe Progress</h3>
                  <div className="flex flex-col gap-8">
                    <div className="flex items-center gap-6">
                      <div className="flex-1 h-20 bg-slate-900 rounded-xl relative overflow-hidden flex items-center px-4 border border-slate-800">
                        {/* Belt Background Representation */}
                        <div className={cn(
                          "absolute left-0 top-0 h-full w-full opacity-80 border-r-4 border-slate-950",
                          currentBelt === 'white' && "bg-white",
                          currentBelt === 'blue' && "bg-blue-600",
                          currentBelt === 'purple' && "bg-purple-700",
                          currentBelt === 'brown' && "bg-amber-900",
                          currentBelt === 'black' && "bg-slate-950"
                        )}></div>
                        <div className="absolute right-0 top-0 h-full w-24 bg-black opacity-90 z-0"></div>

                        {/* Stripes */}
                        <div className="absolute right-0 top-0 h-full w-24 flex items-center justify-center gap-2 z-10">
                          {[1, 2, 3, 4].map((stripe) => (
                            <div
                              key={stripe}
                              className={cn(
                                "w-3 h-12 rounded border",
                                stripe <= earnedStripes
                                  ? "bg-white shadow-[0_0_5px_rgba(255,255,255,0.5)] border-white"
                                  : "bg-slate-800/50 border-slate-700"
                              )}
                            ></div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold font-heading text-primary">{earnedStripes} / 4</span>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase">Stripes</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-bold text-muted-foreground uppercase">Sessions in Grade</span>
                        <span className="text-sm font-semibold">{sessionCount} Sessions</span>
                      </div>
                      <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-1000"
                          style={{ width: `${Math.min(100, (sessionCount / 100) * 100)}%` }} // Assuming ~100 sessions per rank roughly for progress bar visual
                        ></div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Keep training consistently to reach your next stripe evaluation.
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* Rank Requirements */}
              <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200">
                <div className="glass-card p-8 rounded-3xl h-full">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-foreground font-heading">Milestone Checklist</h3>
                    {/* Placeholder completion - typically this would be calculated */}
                    <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded">IN PROGRESS</span>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                      {sessionCount >= 50 ? (
                        <CheckCircle className="text-primary text-xl" />
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                      )}
                      <div className="flex-1">
                        <span className="text-sm font-bold text-foreground">Consistent Attendance</span>
                        <p className="text-[10px] text-muted-foreground">Current count: {sessionCount} sessions since promotion</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border group">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-muted-foreground">Technique Mastery</span>
                        <p className="text-[10px] text-muted-foreground">Demonstrate proficiency in core moves</p>
                      </div>
                      <Info className="text-muted-foreground w-4 h-4" />
                    </div>

                    <div className="flex items-center gap-4 p-4 rounded-2xl bg-secondary/50 border border-border">
                      <div className="w-5 h-5 rounded-full border-2 border-muted-foreground"></div>
                      <div className="flex-1">
                        <span className="text-sm font-bold text-muted-foreground">Professor Evaluation</span>
                        <p className="text-[10px] text-muted-foreground">Pending review</p>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* Promotion History */}
            <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 pb-8">
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4 font-heading">Promotion History</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {achievements.filter(a => a.type === 'belt').sort((a, b) => new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime()).map((achievement) => {
                  const info = parseBeltInfo(achievement.title, 'belt')
                  let borderColor = "border-l-slate-200"
                  let iconColor = "text-slate-200"
                  if (info.belt === 'blue') { borderColor = "border-l-blue-600"; iconColor = "text-blue-400" }
                  if (info.belt === 'purple') { borderColor = "border-l-purple-600"; iconColor = "text-purple-400" }
                  if (info.belt === 'brown') { borderColor = "border-l-amber-900"; iconColor = "text-amber-700" }
                  if (info.belt === 'black') { borderColor = "border-l-slate-900"; iconColor = "text-slate-900" }

                  return (
                    <div key={achievement.id} className={cn("glass-card p-5 rounded-2xl flex items-center gap-4 border-l-4", borderColor)}>
                      <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center">
                        <Trophy className={cn("text-xl", iconColor)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="text-sm font-bold text-foreground truncate">{achievement.title}</h4>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 -mt-1 -mr-1 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteClick(achievement.id)}
                          >
                            <span className="sr-only">Delete</span>
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                          </Button>
                        </div>
                        <p className="text-[10px] text-muted-foreground font-medium">
                          {new Date(achievement.achievedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  )
                })}
                {achievements.filter(a => a.type === 'belt').length === 0 && (
                  <div className="col-span-full py-8 text-center text-muted-foreground">
                    No belt promotions recorded yet.
                  </div>
                )}
              </div>
            </section>
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
