"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Youtube, Trash2 } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import {
  useCreateJournalEntry,
  useUpdateJournalEntry,
  useDeleteJournalEntry,
  useCreateTechnique,
  journalEntryKeys,
} from "@/lib/hooks"

import { JournalEntry as DbJournalEntry } from "@/lib/db/schema"
import { TrainingStyleSelector, TrainingStyle } from "@/components/start-training/training-style-selector"
import { FocusAreaTags } from "@/components/start-training/focus-area-tags"
import { IntensityLevelBar } from "@/components/start-training/intensity-level-bar"
import { ButtonLoader } from "@/components/loading/button-loader"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface Technique {
  id?: string
  name: string
  youtubeUrl: string
  notes: string
}

interface JournalEntryWithTechniques extends DbJournalEntry {
  techniques?: Technique[]
}

interface JournalEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  userId: string
  existingEntry?: JournalEntryWithTechniques
}

export function JournalEntryDialog(props: JournalEntryDialogProps) {
  return props.isOpen
    ? <JournalEntryForm key={props.existingEntry?.id ?? 'new'} {...props} />
    : null
}

function JournalEntryForm({ isOpen, onClose, selectedDate, existingEntry }: JournalEntryDialogProps) {
  const [title, setTitle] = useState(existingEntry?.title || "")
  const [notes, setNotes] = useState(existingEntry?.notes || "")
  const [sessionType, setSessionType] = useState<TrainingStyle>(() => {
    if (existingEntry?.sessionType === 'competition') return 'open_mat'
    if (!existingEntry?.sessionType || existingEntry.sessionType === 'regular') return 'gi'
    return existingEntry.sessionType as TrainingStyle
  })
  const [durationMinutes, setDurationMinutes] = useState(existingEntry?.durationMinutes || 90)
  const [focusAreas, setFocusAreas] = useState<string[]>(() => existingEntry?.focusAreas?.split(",").filter(Boolean) || [])
  const [intensityLevel, setIntensityLevel] = useState(existingEntry?.intensityLevel || 4)
  const [techniques, setTechniques] = useState<Technique[]>(existingEntry?.techniques || [])

  const queryClient = useQueryClient()
  const createEntry = useCreateJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
    },
  })
  const updateEntry = useUpdateJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
    },
  })
  const deleteEntry = useDeleteJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
    },
  })
  const createTechnique = useCreateTechnique()

  const addTechnique = () => {
    setTechniques([...techniques, { name: "", youtubeUrl: "", notes: "" }])
  }

  const removeTechnique = (index: number) => {
    setTechniques(techniques.filter((_, i) => i !== index))
  }

  const updateTechnique = (index: number, field: keyof Technique, value: string) => {
    const updated = [...techniques]
    updated[index] = { ...updated[index], [field]: value }
    setTechniques(updated)
  }

  const handleSave = async () => {
    if (!selectedDate) return

    try {
      if (existingEntry) {
        // Update existing entry
        console.log('Updating entry with ID:', existingEntry.id)
        await updateEntry.mutateAsync({
          id: existingEntry.id,
          data: {
            title: title || undefined,
            sessionType,
            durationMinutes,
            focusAreas: focusAreas.join(",") || undefined,
            intensityLevel,
            notes: notes || undefined,
          },
        })

        // Create new techniques
        if (techniques.length > 0) {
          const validTechniques = techniques.filter((t) => t.name.trim())
          await Promise.all(
            validTechniques.map((t) =>
              createTechnique.mutateAsync({
                journalEntryId: existingEntry.id,
                name: t.name,
                youtubeUrl: t.youtubeUrl || null,
                notes: t.notes || null,
              })
            )
          )
        }
      } else {
        // Create new entry
        const year = selectedDate.getFullYear()
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
        const day = String(selectedDate.getDate()).padStart(2, '0')
        const dateStr = `${year}-${month}-${day}`

        console.log('Saving journal entry with date:', dateStr)

        const entryData = await createEntry.mutateAsync({
          entryDate: dateStr,
          title: title || undefined,
          sessionType,
          durationMinutes,
          focusAreas: focusAreas.join(",") || undefined,
          intensityLevel,
          notes: notes || undefined,
        })

        // Insert techniques
        if (techniques.length > 0) {
          const validTechniques = techniques.filter((t) => t.name.trim())
          await Promise.all(
            validTechniques.map((t) =>
              createTechnique.mutateAsync({
                journalEntryId: entryData.id,
                name: t.name,
                youtubeUrl: t.youtubeUrl || null,
                notes: t.notes || null,
              })
            )
          )
        }
      }

      onClose()
    } catch (error) {
      console.error("Error saving entry:", error)
      alert(error instanceof Error ? error.message : "Failed to save entry. Please try again.")
    }
  }

  const handleDelete = async () => {
    if (!existingEntry) return

    if (!confirm("Are you sure you want to delete this entry?")) return

    try {
      await deleteEntry.mutateAsync(existingEntry.id)
      onClose()
    } catch (error) {
      console.error("Error deleting entry:", error)
      alert(error instanceof Error ? error.message : "Failed to delete entry. Please try again.")
    }
  }

  const isLoading = createEntry.isPending || updateEntry.isPending || deleteEntry.isPending || createTechnique.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-background/95 backdrop-blur-xl text-foreground max-w-2xl max-h-[90vh] overflow-y-auto sm:rounded-2xl shadow-2xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" className="text-foreground font-medium">
                Session Title
              </Label>
              <Input
                id="title"
                placeholder="Morning Gi Class..."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="sessionType" className="text-foreground font-medium">
                Training Style
              </Label>
              <TrainingStyleSelector value={sessionType} onChange={setSessionType} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration" className="text-foreground font-medium">
                Duration (minutes)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  id="duration"
                  type="number"
                  min="15"
                  max="480"
                  step="15"
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 90)}
                  className="bg-background/50 border-input text-foreground focus-visible:ring-primary/30"
                />
                <span className="text-sm text-muted-foreground">minutes</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Focus Areas</Label>
            </div>
            <FocusAreaTags
              selectedAreas={focusAreas}
              onToggleArea={(area) => setFocusAreas(prev =>
                prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area]
              )}
              onAddCustom={(area) => {
                if (!focusAreas.includes(area)) {
                  setFocusAreas(prev => [...prev, area])
                }
              }}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-foreground font-medium">Intensity Level</Label>
            <IntensityLevelBar value={intensityLevel} onChange={setIntensityLevel} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-foreground font-medium">
              Training Notes (Markdown supported)
            </Label>
            <div data-color-mode="dark" className="w-full">
              <MDEditor
                value={notes}
                onChange={(val) => setNotes(val || "")}
                preview="edit"
                height={300}
                textareaProps={{
                  placeholder: "How was today's training? What did you learn?",
                }}
                className="bg-card border-border rounded-lg overflow-hidden"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-foreground font-medium">Techniques Learned</Label>
              <Button
                type="button"
                onClick={addTechnique}
                size="sm"
                variant="outline"
                className="border-dashed border-primary/40 text-primary hover:bg-primary/10 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Technique
              </Button>
            </div>

            {techniques.map((technique, index) => (
              <div
                key={index}
                className="space-y-3 p-4 bg-card/60 rounded-xl border border-border/50 animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Technique name (e.g., Kimura from closed guard)"
                      value={technique.name}
                      onChange={(e) => updateTechnique(index, "name", e.target.value)}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
                    />
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <Input
                        placeholder="YouTube URL"
                        value={technique.youtubeUrl}
                        onChange={(e) => updateTechnique(index, "youtubeUrl", e.target.value)}
                        className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
                      />
                    </div>
                    <Textarea
                      placeholder="Additional notes about this technique..."
                      value={technique.notes}
                      onChange={(e) => updateTechnique(index, "notes", e.target.value)}
                      className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground focus-visible:ring-primary/30"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeTechnique(index)}
                    size="icon"
                    variant="ghost"
                    className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          {existingEntry && (
            <Button
              type="button"
              onClick={handleDelete}
              variant="outline"
              disabled={isLoading}
              className="border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20 hover:text-destructive sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Entry
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          {isLoading ? (
            <ButtonLoader text="Saving..." className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20" />
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Save Entry
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
