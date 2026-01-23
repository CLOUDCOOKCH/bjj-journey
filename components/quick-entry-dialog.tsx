"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, X, Youtube } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateJournalEntry, useCreateTechnique, journalEntryKeys } from "@/lib/hooks"
import { getTodayAsYYYYMMDD } from "@/lib/utils/date"

const MDEditor = dynamic(
  () => import("@uiw/react-md-editor").then((mod) => mod.default),
  { ssr: false }
)

interface Technique {
  name: string
  youtubeUrl: string
  notes: string
}

interface QuickEntryDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function QuickEntryDialog({ isOpen, onClose, userId }: QuickEntryDialogProps) {
  const [entryDate, setEntryDate] = useState(getTodayAsYYYYMMDD())
  const [notes, setNotes] = useState("")
  const [techniques, setTechniques] = useState<Technique[]>([])

  const queryClient = useQueryClient()
  const createEntry = useCreateJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
    },
  })
  const createTechnique = useCreateTechnique()

  const resetForm = () => {
    setEntryDate(getTodayAsYYYYMMDD())
    setNotes("")
    setTechniques([])
  }

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
    console.log('Quick entry saving with date:', entryDate, 'type:', typeof entryDate)
    try {
      // Create new entry
      const entryData = await createEntry.mutateAsync({
        entryDate,
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

      resetForm()
      onClose()
    } catch (error) {
      console.error("Error saving entry:", error)
      alert(error instanceof Error ? error.message : "Failed to save entry. Please try again.")
    }
  }

  const isLoading = createEntry.isPending || createTechnique.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-900 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Quick Training Entry</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-200">
              Training Date
            </Label>
            <Input
              id="date"
              type="date"
              value={entryDate}
              onChange={(e) => setEntryDate(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

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
