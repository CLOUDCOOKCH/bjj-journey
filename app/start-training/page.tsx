"use client"

import { useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"
import { useTheme } from "next-themes"
import dynamic from "next/dynamic"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import type { TrainingStyle } from "@/components/start-training/training-style-selector"
import { FocusAreaTags } from "@/components/start-training/focus-area-tags"
import { IntensityLevelBar } from "@/components/start-training/intensity-level-bar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import type { TrainingDetails } from "@/lib/validations/journal-details"
import { Save, X } from "lucide-react"
import { useCreateJournalEntry, useUpdateJournalEntry } from "@/lib/hooks"
import { journalEntryKeys } from "@/lib/hooks"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { formatDateToYYYYMMDD } from "@/lib/utils/date"
import type { JournalEntryWithTechniques } from "@/lib/hooks/use-journal-entries"
import { get } from "@/lib/api/client"
import { trainingClient, type TrainingRecord } from "@/lib/training/client"
import { formatCalendarDate, isCalendarDate, type PlannedActivity } from "@/lib/training/planner"
import { trainingQueryKey } from "@/lib/training/planner-client"
import { PageSkeleton } from "@/components/loading/page-skeleton"
import { PageHeader } from "@/components/page-header"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

function defaultStyle(activity?: PlannedActivity): TrainingStyle {
  if (activity?.category === "bjj_no_gi") return "no_gi"
  if (activity?.category === "open_mat") return "open_mat"
  if (activity?.category === "competition") return "competition"
  if (activity?.category === "private_lesson") return "regular"
  return "gi"
}

function StartTrainingForm({ initialDate, entry, activity }: {
  initialDate: string
  entry?: JournalEntryWithTechniques
  activity?: TrainingRecord<PlannedActivity>
}) {
  const router = useRouter()
  const { resolvedTheme } = useTheme()
  const queryClient = useQueryClient()
  const initialStyle = (entry?.sessionType === "nogi" ? "no_gi" : entry?.sessionType) as TrainingStyle | undefined
  const [title, setTitle] = useState(entry?.title ?? activity?.data.title ?? "")
  const [trainingStyle, setTrainingStyle] = useState<TrainingStyle>(initialStyle || defaultStyle(activity?.data))
  const [durationMinutes, setDurationMinutes] = useState(entry?.durationMinutes ?? Math.max(15, Math.min(480, activity?.data.durationMinutes || 90)))
  const [focusAreas, setFocusAreas] = useState<string[]>(entry?.focusAreas?.split(",").filter(Boolean) ?? [])
  const [intensityLevel, setIntensityLevel] = useState<number | undefined>(entry?.intensityLevel ?? undefined)
  const [trainingDetails, setTrainingDetails] = useState<TrainingDetails>(entry?.trainingDetails ?? {})
  const [sessionRpe, setSessionRpe] = useState<number | undefined>(entry?.sessionRpe ?? undefined)
  const [notes, setNotes] = useState(entry?.notes ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState("")

  const createEntry = useCreateJournalEntry()
  const updateEntry = useUpdateJournalEntry()

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
    setSaveError("")
    try {
      const details = {
        sessionType: trainingStyle,
        title: title.trim() || undefined,
        focusAreas: focusAreas.join(",") || undefined,
        intensityLevel,
        durationMinutes,
        sessionRpe: sessionRpe ?? null,
        trainingDetails,
        notes: notes || null,
      }
      if (entry) {
        await updateEntry.mutateAsync({ id: entry.id, data: details })
      } else if (activity) {
        await trainingClient.action<PlannedActivity>("activities", activity.id, "journal", {
          version: activity.version,
          data: { ...details, entryDate: initialDate },
        })
        await queryClient.invalidateQueries({ queryKey: trainingQueryKey("activities") })
      } else {
        await createEntry.mutateAsync({ ...details, entryDate: initialDate })
      }
      await queryClient.invalidateQueries({ queryKey: journalEntryKeys.all })
      router.push(activity ? `/calendar?date=${initialDate}` : "/journal")
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : "Failed to save session. Try again.")
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <MobileBottomNav />

      <main className="lg:ml-64 pb-20 lg:pb-8">
        <PageHeader
          title={entry ? "Edit mat session" : "Log mat session"}
          subtitle={`Logging session for ${formatCalendarDate(initialDate, { dateStyle: "long" })}`}
          backButton={true}
        />

        <div className="container mx-auto px-4 lg:px-8 py-8 max-w-5xl">
          <form onSubmit={(event) => { event.preventDefault(); void handleSave() }} className="mx-auto max-w-2xl space-y-5">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1 sm:col-span-1">
                <Label htmlFor="journal-style">Session type</Label>
                <select id="journal-style" className="min-h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={trainingStyle} onChange={event => setTrainingStyle(event.target.value as TrainingStyle)}>
                  <option value="gi">Gi</option><option value="no_gi">No-Gi</option>
                  <option value="open_mat">Open mat</option><option value="drilling">Drilling</option>
                  <option value="competition">Competition</option><option value="regular">Other mat session</option>
                </select>
              </div>
              <div className="space-y-1">
                <Label htmlFor="journal-duration">Mat time (min)</Label>
                <Input id="journal-duration" className="min-h-11" type="number" min={15} max={480} required
                  value={Number.isNaN(durationMinutes) ? "" : durationMinutes}
                  onChange={(event) => setDurationMinutes(event.target.valueAsNumber)} />
              </div>
              <div className="space-y-1">
                <Label htmlFor="journal-rounds">Sparring rounds</Label>
                <Input id="journal-rounds" className="min-h-11" type="number" min={0} max={500}
                  value={trainingDetails.sparringRounds ?? ""}
                  onChange={(event) => {
                    const sparringRounds = event.target.value === "" ? undefined : event.target.valueAsNumber
                    setTrainingDetails(current => ({ ...current, sparringRounds }))
                  }} />
              </div>
            </div>

            <div className="space-y-3">
              {([
                ["positionsTrained", "Positions trained", "e.g. Half guard, side control"],
                ["successfulTechniques", "What worked?", "e.g. Underhook sweep from half guard"],
                ["techniquesToImprove", "What will you drill next?", "e.g. Recover my frames from bottom side control"],
              ] as const).map(([key, label, placeholder]) => (
                <div key={key} className="space-y-1">
                  <Label htmlFor={`journal-${key}`}>{label}</Label>
                  <Textarea id={`journal-${key}`} rows={2} maxLength={2000} placeholder={placeholder}
                    value={trainingDetails[key] ?? ""}
                    onChange={(event) => {
                      const value = event.target.value
                      setTrainingDetails(current => ({ ...current, [key]: value }))
                    }} />
                </div>
              ))}
            </div>

            <details className="rounded-lg border border-border bg-card">
              <summary className="min-h-11 cursor-pointer px-3 py-3 text-sm font-medium">More session details</summary>
              <div className="space-y-4 border-t p-3">
                <div className="space-y-1">
                  <Label htmlFor="journal-title">Session title</Label>
                  <Input id="journal-title" maxLength={200} placeholder="Morning Gi class"
                    value={title} onChange={(event) => setTitle(event.target.value)} />
                </div>
                <FocusAreaTags selectedAreas={focusAreas} onToggleArea={handleToggleFocusArea} onAddCustom={handleAddCustomFocusArea} />
                <div>
                  <p className="mb-2 text-sm font-medium">Intensity</p>
                  <IntensityLevelBar value={intensityLevel ?? 0} onChange={setIntensityLevel} />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="journal-rpe">Session effort (0–10)</Label>
                  <Input id="journal-rpe" type="number" min={0} max={10} step={1} value={sessionRpe ?? ""} onChange={(event) => {
                    setSessionRpe(event.target.value === "" ? undefined : event.target.valueAsNumber)
                  }} />
                </div>
                <div data-color-mode={resolvedTheme === "dark" ? "dark" : "light"}>
                  <Label className="mb-2 block" htmlFor="journal-notes">Session notes</Label>
                  <MDEditor value={notes} onChange={(value) => setNotes(value || "")} preview="edit" height={220}
                    textareaProps={{ id: "journal-notes", placeholder: "Any other notes from class?" }} />
                </div>
              </div>
            </details>

            {saveError && <p role="alert" className="text-sm font-medium text-destructive">{saveError}</p>}
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

function StartTrainingContent() {
  const params = useSearchParams()
  const { data: session, status } = useSession()
  const id = session?.user?.id
  const entryId = params.get("entryId")
  const activityId = params.get("activityId")
  const entry = useQuery({
    queryKey: [...journalEntryKeys.detail(entryId ?? ""), id],
    queryFn: () => get<JournalEntryWithTechniques>(`/api/journal-entries/${encodeURIComponent(entryId!)}`),
    enabled: Boolean(id && entryId),
  })
  const activity = useQuery({
    queryKey: [...trainingQueryKey("activities"), activityId, id],
    queryFn: () => trainingClient.get<PlannedActivity>("activities", activityId!),
    enabled: Boolean(id && activityId && !entryId),
  })

  if (status === "loading" || entry.isLoading || activity.isLoading) return <PageSkeleton />
  if (!id || entry.isError || activity.isError || (activity.data && !["planned", "in_progress"].includes(activity.data.data.status))) {
    const message = !id ? "Sign in to log a mat session." : entry.isError ? "The journal entry could not be loaded." : "This planned activity is unavailable."
    return <div className="min-h-screen bg-background">
      <SidebarNav /><MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <PageHeader title="Mat session" backButton />
        <p className="px-4 py-8 text-muted-foreground" role="status">{message}</p>
      </main>
    </div>
  }

  const date = params.get("date")
  const initialDate = entry.data?.entryDate ?? activity.data?.data.date ?? (isCalendarDate(date) ? date : formatDateToYYYYMMDD(new Date()))

  return <StartTrainingForm key={entryId ?? activityId ?? initialDate} initialDate={initialDate} entry={entry.data} activity={activity.data} />
}

export default function StartTrainingPage() {
  return <Suspense fallback={<PageSkeleton />}><StartTrainingContent /></Suspense>
}
