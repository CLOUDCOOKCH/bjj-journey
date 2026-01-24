"use client"

import { useState } from "react"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface FocusAreaTagsProps {
  selectedAreas: string[]
  onToggleArea: (area: string) => void
  onAddCustom: (area: string) => void
}

const predefinedAreas = [
  "Closed Guard",
  "Butterfly Guard",
  "Half Guard",
  "De La Riva",
  "Passing",
  "Back Takes",
  "Mount Escapes",
  "Side Control",
  "Leg Locks",
  "Chokes",
  "Arm Locks",
  "Sub Defense",
]

export function FocusAreaTags({ selectedAreas, onToggleArea, onAddCustom }: FocusAreaTagsProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [customArea, setCustomArea] = useState("")

  const isSelected = (area: string) => selectedAreas.includes(area)

  // Combine predefined areas with any custom selected areas, removing duplicates
  const allAreas = Array.from(new Set([...predefinedAreas, ...selectedAreas]))

  const handleOpenDialog = () => {
    setCustomArea("")
    setIsDialogOpen(true)
  }

  const handleSaveCustom = () => {
    if (customArea && customArea.trim()) {
      onAddCustom(customArea.trim())
      setIsDialogOpen(false)
    }
  }

  return (
    <>
      <div className="flex flex-wrap gap-2">
        {allAreas.map((area) => (
          <button
            key={area}
            type="button"
            onClick={() => onToggleArea(area)}
            className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all ${isSelected(area)
                ? "border-primary bg-primary/10 text-primary"
                : "border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
              }`}
          >
            {area}
          </button>
        ))}
        <button
          type="button"
          onClick={handleOpenDialog}
          className="px-3 py-2 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-1"
        >
          <Plus className="text-sm" />
          <span className="text-xs font-semibold">Add</span>
        </button>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Custom Focus Area</DialogTitle>
          </DialogHeader>
          <div className="flex items-center space-x-2 py-4">
            <div className="grid flex-1 gap-2">
              <Label htmlFor="custom-area" className="sr-only">
                Focus Area
              </Label>
              <Input
                id="custom-area"
                placeholder="Ex: Leg Drag"
                value={customArea}
                onChange={(e) => setCustomArea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    handleSaveCustom()
                  }
                }}
              />
            </div>
          </div>
          <DialogFooter className="sm:justify-start">
            <DialogClose asChild>
              <Button type="button" variant="secondary">
                Cancel
              </Button>
            </DialogClose>
            <Button type="button" onClick={handleSaveCustom}>
              Add
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
