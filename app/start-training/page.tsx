"use client"

import { useState, useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import dynamic from "next/dynamic"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { TrainingStyleSelector, TrainingStyle } from "@/components/start-training/training-style-selector"
import { FocusAreaTags } from "@/components/start-training/focus-area-tags"
import { IntensityLevelBar } from "@/components/start-training/intensity-level-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Save, X } from "lucide-react"
import { useCreateJournalEntry, useUpdateJournalEntry } from "@/lib/hooks"
import { journalEntryKeys } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { formatDateToYYYYMMDD } from "@/lib/utils/date"
import { useJournalEntries } from "@/lib/hooks"
import { StartTrainingSearchParams } from "@/components/start-training/start-training-search-params"
import { PageSkeleton } from "@/components/loading/page-skeleton"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

function StartTrainingForm({ searchParams, userId, entries }: { searchParams: URLSearchParams, userId?: string, entries: any[] }) {
  const router = useRouter()

  const [title, setTitle] = useState("")
  const [trainingStyle, setTrainingStyle] = useState<TrainingStyle>("gi")
  const [durationMinutes, setDurationMinutes] = useState(90)
  const [focusAreas, setFocusAreas] = useState<string[]>([])
  const [intensityLevel, setIntensityLevel] = useState(4)
  const [notes, setNotes] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date())

  const queryClient = useQueryClient()

  const createEntry = useCreateJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
      router.push("/calendar")
    },
  })

  const updateEntry = useUpdateJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
      router.push("/calendar")
    },
  })

  useEffect(() => {
    const dateParam = searchParams.get("date")
    const entryId = searchParams.get("entryId")

    if (dateParam) {
      const [year, month, day] = dateParam.split("-").map(Number)
      setSelectedDate(new Date(year, month - 1, day))
    }

    if (entryId && entries.length > 0) {
      const existingEntry = entries.find((e) => e.id === entryId)
      if (existingEntry) {
        setTitle(existingEntry.title || "")
        setTrainingStyle((existingEntry.sessionType as TrainingStyle) || "gi")
        setDurationMinutes(existingEntry.durationMinutes || 90)
        setFocusAreas(existingEntry.focusAreas?.split(",").filter(Boolean) || [])
        setIntensityLevel(existingEntry.intensityLevel || 4)
        setNotes(existingEntry.notes || "")
      }
    }
  }, [searchParams, entries])

  const handleToggleFocusArea = (area: string) => {
    setFocusAreas((prev) =>
      prev.includes(area) ? prev.filter((a) => a !== area) : [...prev, area]
    )
  }

  const handleAddCustomFocusArea = (area: string) => {
    if (!focusAreas.includes(area)) {
      setFocusAreas((prev) => [...prev, area])
    }
  }

  const handleSave = async () => {
    if (isSaving) return

    setIsSaving(true)
    try {
      const dateStr = formatDateToYYYYMMDD(selectedDate)
      const focusAreasCsv = focusAreas.join(",")
      const entryId = searchParams.get("entryId")

      if (entryId) {
        await updateEntry.mutateAsync({
          id: entryId,
          data: {
            sessionType: trainingStyle,
            title: title || undefined,
            focusAreas: focusAreasCsv || undefined,
            intensityLevel,
            durationMinutes,
            notes: notes || undefined,
          },
        })
      } else {
        await createEntry.mutateAsync({
          entryDate: dateStr,
          sessionType: trainingStyle,
          title: title || undefined,
          focusAreas: focusAreasCsv || undefined,
          intensityLevel,
          durationMinutes,
          notes: notes || undefined,
        })
      }
    } catch (error) {
      console.error("Error saving session:", error)
      alert(error instanceof Error ? error.message : "Failed to save session. Please try again.")
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <MobileBottomNav />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="icon"
              onClick={() => router.back()}
              className="border-border hover:bg-card"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-foreground">Start Training Session</h1>
              <p className="text-xs text-muted-foreground font-medium">
                Logging session for {selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
          <form onSubmit={(e) => { e.preventDefault(); handleSave() }} className="space-y-8">
            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-card/40 border border-border/50">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  Session Title
                </Label>
                <Input
                  placeholder="Morning Gi Class..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="bg-background/50 border-border text-foreground placeholder:text-muted-foreground"
                />
              </div>
              <div className="p-6 rounded-3xl bg-card/40 border border-border/50">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  Duration (Minutes)
                </Label>
                <div className="flex items-center gap-4">
                  <input
                    type="range"
                    min="30"
                    max="180"
                    step="15"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(parseInt(e.target.value))}
                    className="flex-1 h-1.5 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
                  />
                  <span className="font-bold text-primary w-16 text-right">{durationMinutes}m</span>
                </div>
              </div>
            </section>

            <section className="p-8 rounded-3xl bg-card/40 border border-border/50">
              <h2 className="text-sm font-bold text-foreground mb-6">Training Style</h2>
              <TrainingStyleSelector value={trainingStyle} onChange={setTrainingStyle} />
            </section>

            <section className="p-8 rounded-3xl bg-card/40 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-sm font-bold text-foreground">Focus Areas</h2>
                <span className="text-[10px] font-bold text-muted-foreground uppercase">
                  Select all that apply
                </span>
              </div>
              <FocusAreaTags
                selectedAreas={focusAreas}
                onToggleArea={handleToggleFocusArea}
                onAddCustom={handleAddCustomFocusArea}
              />
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 rounded-3xl bg-card/40 border border-border/50">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-6 block">
                  Intensity Level
                </Label>
                <IntensityLevelBar value={intensityLevel} onChange={setIntensityLevel} />
              </div>
              <div className="p-6 rounded-3xl bg-card/40 border border-border/50">
                <Label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-4 block">
                  Session Notes (Markdown supported)
                </Label>
                <div data-color-mode="dark" className="w-full">
                  <MDEditor
                    value={notes}
                    onChange={(val) => setNotes(val || "")}
                    preview="edit"
                    height={300}
                    textareaProps={{
                      placeholder: "How did it feel? Specific details about your rolls...",
                    }}
                    className="bg-card border-border rounded-lg overflow-hidden"
                  />
                </div>
              </div>
            </section>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                type="submit"
                disabled={isSaving}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-4 px-8 rounded-2xl shadow-lg shadow-primary/10 transition-all"
              >
                <Save className="mr-2 h-5 w-5" />
                {isSaving ? "Saving..." : "Save Session"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isSaving}
                className="px-8 py-4 rounded-2xl font-semibold border-border hover:bg-card"
              >
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  )
}

export default function StartTrainingPage() {
  return (
    <Suspense fallback={<PageSkeleton />}>
      <StartTrainingSearchParams>
        {(searchParams) => {
          const { data: session, status } = useSession()
          const userId = session?.user?.id
          const isAuthenticated = status === "authenticated"
          const { data: entries = [] } = useJournalEntries(isAuthenticated)

          if (status === "loading") {
            return <PageSkeleton />
          }

          if (!userId) {
            return (
              <div className="min-h-screen bg-background">
                <SidebarNav />
                <MobileBottomNav />
                <main className="lg:ml-64 pb-20 lg:pb-8">
                  <div className="container mx-auto px-4 py-8">
                    <p className="text-muted-foreground">Please log in to access this page.</p>
                  </div>
                </main>
              </div>
            )
          }

          return <StartTrainingForm searchParams={searchParams} userId={userId} entries={entries} />
        }}
      </StartTrainingSearchParams>
    </Suspense>
  )
}
