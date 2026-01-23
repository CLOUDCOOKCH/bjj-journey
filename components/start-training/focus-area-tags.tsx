"use client"

import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"

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
  const isSelected = (area: string) => selectedAreas.includes(area)

  const handleAddCustom = () => {
    const customArea = prompt("Enter custom focus area:")
    if (customArea && customArea.trim()) {
      onAddCustom(customArea.trim())
    }
  }

  return (
    <div className="flex flex-wrap gap-2">
      {predefinedAreas.map((area) => (
        <button
          key={area}
          type="button"
          onClick={() => onToggleArea(area)}
          className={`px-4 py-2 rounded-full border-2 text-xs font-semibold transition-all ${
            isSelected(area)
              ? "border-primary bg-primary/10 text-primary"
              : "border-border bg-card/50 text-muted-foreground hover:bg-card hover:text-foreground"
          }`}
        >
          {area}
        </button>
      ))}
      <button
        type="button"
        onClick={handleAddCustom}
        className="px-3 py-2 rounded-full border-2 border-dashed border-border text-muted-foreground hover:border-primary hover:text-primary transition-all flex items-center gap-1"
      >
        <Plus className="text-sm" />
        <span className="text-xs font-semibold">Add</span>
      </button>
    </div>
  )
}
