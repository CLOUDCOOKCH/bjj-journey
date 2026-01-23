"use client"

import { useState, useEffect } from "react"
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

interface JournalEntry {
  id: string
  entryDate: string
  notes: string | null
  techniques: Technique[]
}

interface JournalEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  selectedDate: Date | null
  userId: string
  existingEntry?: JournalEntry
}

export function JournalEntryDialog({ isOpen, onClose, selectedDate, userId, existingEntry }: JournalEntryDialogProps) {
  const [notes, setNotes] = useState("")
  const [techniques, setTechniques] = useState<Technique[]>([])

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

  useEffect(() => {
    if (existingEntry) {
      setNotes(existingEntry.notes || "")
      setTechniques(existingEntry.techniques || [])
    } else {
      setNotes("")
      setTechniques([])
    }
  }, [existingEntry, isOpen])

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
          data: { notes: notes || null },
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
          notes: notes || null,
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
      <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">
            {selectedDate?.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-slate-200">
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
                className="bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-slate-200">Techniques Learned</Label>
              <Button
                type="button"
                onClick={addTechnique}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Technique
              </Button>
            </div>

            {techniques.map((technique, index) => (
              <div
                key={index}
                className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 animate-in fade-in slide-in-from-bottom-4 duration-300"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 space-y-3">
                    <Input
                      placeholder="Technique name (e.g., Kimura from closed guard)"
                      value={technique.name}
                      onChange={(e) => updateTechnique(index, "name", e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                    <div className="flex items-center gap-2">
                      <Youtube className="h-4 w-4 text-red-500 flex-shrink-0" />
                      <Input
                        placeholder="YouTube URL"
                        value={technique.youtubeUrl}
                        onChange={(e) => updateTechnique(index, "youtubeUrl", e.target.value)}
                        className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <Textarea
                      placeholder="Additional notes about this technique..."
                      value={technique.notes}
                      onChange={(e) => updateTechnique(index, "notes", e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <Button
                    type="button"
                    onClick={() => removeTechnique(index)}
                    size="icon"
                    variant="ghost"
                    className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
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
              className="border-red-900/50 bg-red-950/30 text-red-400 hover:bg-red-950/50 hover:text-red-300 sm:mr-auto"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Entry
            </Button>
          )}
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            {isLoading ? "Saving..." : "Save Entry"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
