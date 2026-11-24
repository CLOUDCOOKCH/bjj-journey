"use client"

import { redirect } from "next/navigation"
import { useSession } from "next-auth/react"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import {
  useInfiniteJournalEntries,
  useDeleteJournalEntry,
  journalEntryKeys,
  useProfile,
  type JournalEntryWithTechniques
} from "@/lib/hooks"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ButtonLoader } from "@/components/loading/button-loader"
import {
  Search,
  Clock,
  BookOpen,
  X,
  Trash2,
  ChevronDown,
  List
} from "lucide-react"
import { formatDateString } from "@/lib/utils/date"
import Link from "next/link"
import { useState, useMemo } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useQueryClient } from "@tanstack/react-query"
import { JournalSkeleton } from "@/components/loading/page-skeleton"
import { PageHeader } from "@/components/page-header"

const sessionTypes = [
  { value: "all", label: "All" },
  { value: "gi", label: "Gi" },
  { value: "no_gi", label: "No-Gi" },
  { value: "drilling", label: "Drilling" },
  { value: "open_mat", label: "Open mat" },
  { value: "competition", label: "Competition" },
]

const sortOptions = [
  { value: "latest", label: "Latest First" },
  { value: "oldest", label: "Oldest First" },
  { value: "duration", label: "Duration" },
  { value: "intensity", label: "Intensity" },
]

function getSessionTypeBadge(type: string) {
  const typeConfig: Record<string, { color: string; label: string }> = {
    gi: { color: "bg-teal-500/10 text-teal-400 border-teal-500/20", label: "Gi" },
    no_gi: { color: "bg-purple-500/10 text-purple-400 border-purple-500/20", label: "No-Gi" },
    open_mat: { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", label: "Open Mat" },
    private: { color: "bg-green-500/10 text-green-400 border-green-500/20", label: "Private" },
    competition: { color: "bg-red-500/10 text-red-400 border-red-500/20", label: "Competition" },
    drilling: { color: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20", label: "Drilling" },
    regular: { color: "bg-slate-500/10 text-slate-400 border-slate-500/20", label: "Regular" },
  }
  return typeConfig[type] || typeConfig.regular
}

function getIntensityColor(level: number | null) {
  if (level === null) return "bg-slate-700"
  if (level <= 2) return "bg-teal-500"
  if (level <= 3) return "bg-yellow-500"
  if (level <= 4) return "bg-orange-500"
  return "bg-red-500"
}

function getIntensityLabel(level: number | null) {
  if (level === null) return ""
  if (level <= 2) return "Low"
  if (level <= 3) return "Moderate"
  if (level <= 4) return "High"
  return "Extreme"
}

export default function JournalPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSort, setSelectedSort] = useState<string>("latest")
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [isSortOpen, setIsSortOpen] = useState(false)

  const queryClient = useQueryClient()
  const { data, isLoading, hasNextPage, fetchNextPage, isFetchingNextPage } = useInfiniteJournalEntries(selectedSort, isAuthenticated)
  const { data: profile, isLoading: profileLoading } = useProfile(isAuthenticated)
  const deleteEntry = useDeleteJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.list(selectedSort) })
      setEntryToDelete(null)
    },
  })

  const allEntries = useMemo(() => data?.pages.flatMap((page) => page.entries) || [], [data])
  const totalEntries = useMemo(() => data?.pages[0]?.total || 0, [data])

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry: JournalEntryWithTechniques) => {
      const matchesSearch = !searchQuery ||
        entry.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.notes?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        [entry.trainingDetails?.positionsTrained, entry.trainingDetails?.successfulTechniques, entry.trainingDetails?.techniquesToImprove]
          .some(value => value?.toLowerCase().includes(searchQuery.toLowerCase())) ||
        entry.techniques.some(t =>
          t.name.toLowerCase().includes(searchQuery.toLowerCase())
        )

      const matchesType = selectedType === "all" || (entry.sessionType === "nogi" ? "no_gi" : entry.sessionType) === selectedType

      return matchesSearch && matchesType
    })
  }, [allEntries, searchQuery, selectedType])

  const selectedSortLabel = useMemo(() =>
    sortOptions.find(opt => opt.value === selectedSort)?.label || "Latest First",
    [selectedSort]
  )

  if (status === "loading") {
    return <JournalSkeleton />
  }

  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  if (isLoading || profileLoading) {
    return <JournalSkeleton belt={profile?.belt} />
  }

  const handleDelete = async () => {
    if (entryToDelete) {
      await deleteEntry.mutateAsync(entryToDelete)
    }
  }

  const displayedCount = filteredEntries.length
  const showingText = totalEntries > 0
    ? `Showing 1-${displayedCount} of ${totalEntries} total session${totalEntries === 1 ? '' : 's'}`
    : ""

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={profile?.belt} name={profile?.user?.name || undefined} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <PageHeader
          title="Journal"
          subtitle="Your complete training history & progress logs"
          actions={
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline"><Link href="/journal/reflections">Weekly reflection</Link></Button>
            <Button asChild className="rounded-full shadow-lg shadow-primary/10 w-full sm:w-auto justify-center">
              <Link href="/start-training">
                <BookOpen className="h-4 w-4 mr-2" />
                <span className="hidden sm:inline">New Session</span>
                <span className="sm:hidden">New</span>
              </Link>
            </Button>
            </div>
          }
        />
        <div className="container mx-auto px-4 lg:px-8 py-8 space-y-8">
          {/* Search Bar */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search sessions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-background/50 border-border w-full rounded-full"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery("")}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          <section className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-2 bg-background/40 p-1 rounded-xl border border-border/50 overflow-x-auto">
                {sessionTypes.map((type) => (
                  <Button
                    key={type.value}
                    variant={selectedType === type.value ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSelectedType(type.value)}
                    className={selectedType === type.value ? "bg-primary" : ""}
                  >
                    {type.label}
                  </Button>
                ))}
              </div>

              <div className="flex items-center gap-4">
                <Collapsible open={isSortOpen} onOpenChange={setIsSortOpen}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <span>{selectedSortLabel}</span>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="absolute right-0 top-full mt-2 z-50 min-w-[160px] bg-card border border-border rounded-lg shadow-lg overflow-hidden">
                    {sortOptions.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => {
                          setSelectedSort(option.value)
                          setIsSortOpen(false)
                        }}
                        className={`w-full px-4 py-2 text-left text-sm hover:bg-accent transition-colors ${selectedSort === option.value ? "bg-accent text-foreground" : "text-muted-foreground"
                          }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </CollapsibleContent>
                </Collapsible>

                <div className="h-6 w-[1px] bg-border" />

                <div className="flex items-center bg-background/40 p-1 rounded-lg border border-border/50">
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0 bg-primary/10 text-primary">
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </section>

          <div className="space-y-4">
            {filteredEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-6">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <BookOpen className="h-10 w-10 text-primary" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-2xl font-bold text-foreground">
                    {searchQuery || selectedType !== "all" ? "No matching entries" : "No entries yet"}
                  </h2>
                  <p className="text-muted-foreground max-w-md">
                    {searchQuery || selectedType !== "all"
                      ? "Try adjusting your search or filters"
                      : "Start logging your training sessions to build your journal"}
                  </p>
                </div>
                {!searchQuery && selectedType === "all" && (
                  <Button asChild className="rounded-full mt-4">
                    <Link href="/start-training">Add Your First Entry</Link>
                  </Button>
                )}
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {filteredEntries.map((entry: JournalEntryWithTechniques, index: number) => {
                    const badgeConfig = getSessionTypeBadge(entry.sessionType === "nogi" ? "no_gi" : entry.sessionType)
                    const displayTitle = entry.title || `${badgeConfig.label} Session`

                    return (
                      <div
                        key={entry.id}
                        className="group animate-in fade-in slide-in-from-bottom-4 duration-300 relative"
                        style={{ animationDelay: `${index * 50}ms` }}
                      >
                        <Card className="p-6 border-border/50 bg-card/40 backdrop-blur-md hover:border-primary/30 transition-all duration-300 cursor-pointer">
                          <Link href={`/start-training?date=${entry.entryDate}&entryId=${entry.id}`}>
                            <div className="flex flex-col lg:flex-row gap-6 items-start">
                              <div className="w-full lg:w-32 flex flex-row lg:flex-col items-center lg:items-start justify-between lg:justify-start gap-1 shrink-0">
                                <span className="text-primary font-semibold uppercase">
                                  {formatDateString(entry.entryDate, { month: "short", day: "numeric" })}
                                </span>
                                <span className="text-muted-foreground text-xs uppercase tracking-widest">
                                  {formatDateString(entry.entryDate, { year: "numeric" })}
                                </span>
                              </div>

                              <div className="flex-1 min-w-0">
                                <div className="flex flex-wrap items-center gap-3 mb-2">
                                  <h3 className="text-xl font-semibold text-foreground group-hover:text-primary transition-colors">
                                    {displayTitle}
                                  </h3>
                                  <Badge variant="outline" className={badgeConfig.color}>
                                    {badgeConfig.label}
                                  </Badge>
                                  {entry.intensityLevel !== null && entry.intensityLevel > 0 && (
                                    <div className="flex items-center gap-1.5 ml-auto md:ml-0">
                                      <span className="text-xs text-muted-foreground">Intensity:</span>
                                      <div className="flex gap-0.5">
                                        {[1, 2, 3, 4, 5].map((i) => (
                                          <div
                                            key={i}
                                            className={`w-1.5 h-3 rounded-full ${i <= (entry.intensityLevel || 0) ? getIntensityColor(entry.intensityLevel) : "bg-border"
                                              }`}
                                          />
                                        ))}
                                      </div>
                                      <span className="text-xs font-semibold text-foreground ml-1">
                                        {getIntensityLabel(entry.intensityLevel)}
                                      </span>
                                    </div>
                                  )}
                                </div>

                                {entry.trainingDetails?.techniquesToImprove && (
                                  <p className="mb-2 line-clamp-2 text-sm"><strong className="font-medium">Drill next</strong>{" "}{entry.trainingDetails.techniquesToImprove}</p>
                                )}
                                {entry.trainingDetails?.sparringRounds != null && (
                                  <p className="mb-2 text-xs text-muted-foreground">{entry.trainingDetails.sparringRounds} sparring {entry.trainingDetails.sparringRounds === 1 ? "round" : "rounds"}</p>
                                )}

                                {entry.notes && (
                                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                                    {entry.notes}
                                  </p>
                                )}

                                <div className="flex flex-wrap items-center gap-4">
                                  <div className="flex flex-wrap gap-2">
                                    {entry.focusAreas && entry.focusAreas.split(",").filter(Boolean).map((area, i) => (
                                      <Badge key={i} variant="secondary" className="text-[11px]">
                                        {area.trim()}
                                      </Badge>
                                    ))}
                                  </div>

                                  <div className="hidden sm:flex items-center gap-4 ml-auto text-xs text-muted-foreground border-l border-border pl-4">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-4 w-4 text-primary" />
                                      <span>{entry.durationMinutes || 0} mins</span>
                                    </div>
                                  </div>

                                  <div className="flex sm:hidden items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="h-4 w-4 text-primary" />
                                      <span>{entry.durationMinutes || 0} mins</span>
                                    </div>
                                  </div>
                                </div>

                                {entry.techniques && entry.techniques.length > 0 && (
                                  <div className="pt-4 border-t border-border/50 mt-4">
                                    <div className="flex items-center gap-2 mb-2">
                                      <BookOpen className="h-4 w-4 text-primary" />
                                      <span className="text-sm font-medium text-foreground">
                                        {entry.techniques.length} {entry.techniques.length === 1 ? "Technique" : "Techniques"}
                                      </span>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                      {entry.techniques.map((technique) => (
                                        <Badge key={technique.id} variant="outline" className="text-[11px]">
                                          {technique.name}
                                        </Badge>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>

                              <div className="flex lg:hidden items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                  onClick={(e) => {
                                    e.preventDefault()
                                    e.stopPropagation()
                                    setEntryToDelete(entry.id)
                                  }}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </Link>
                          <div className="border-t border-border px-4 py-2">
                            <Button asChild variant="ghost">
                              <Link href={`/journal/${entry.id}/details`}>Session reflection</Link>
                            </Button>
                          </div>

                          <div className="hidden lg:flex absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity items-center gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                              onClick={(e) => {
                                e.preventDefault()
                                setEntryToDelete(entry.id)
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </Card>
                      </div>
                    )
                  })}
                </div>

                {filteredEntries.length < totalEntries && (
                  <div className="mt-12 flex flex-col items-center gap-6">
                    {isFetchingNextPage ? (
                      <ButtonLoader text="Loading sessions..." variant="outline" className="rounded-full" />
                    ) : (
                      <Button
                        onClick={() => fetchNextPage()}
                        disabled={!hasNextPage}
                        variant="outline"
                        className="rounded-full"
                      >
                        Load more sessions
                      </Button>
                    )}
                    {showingText && (
                      <p className="text-xs text-muted-foreground uppercase tracking-widest">{showingText}</p>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>

      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your training session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-input hover:bg-accent hover:text-accent-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
