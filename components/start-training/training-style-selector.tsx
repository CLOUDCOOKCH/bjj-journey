"use client"

import { User, ShieldOff, Target, Flame } from "lucide-react"

export type TrainingStyle = "gi" | "no_gi" | "drilling" | "open_mat"

interface TrainingStyleSelectorProps {
  value: TrainingStyle
  onChange: (value: TrainingStyle) => void
}

const trainingStyles = [
  { value: "gi" as TrainingStyle, label: "Gi", icon: User },
  { value: "no_gi" as TrainingStyle, label: "No-Gi", icon: ShieldOff },
  { value: "drilling" as TrainingStyle, label: "Drilling", icon: Target },
  { value: "open_mat" as TrainingStyle, label: "Open Mat", icon: Flame },
]

export function TrainingStyleSelector({ value, onChange }: TrainingStyleSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
      {trainingStyles.map((style) => {
        const Icon = style.icon
        const isSelected = value === style.value

        return (
          <label key={style.value} className="cursor-pointer group">
            <input
              type="radio"
              name="training-style"
              value={style.value}
              checked={isSelected}
              onChange={() => onChange(style.value)}
              className="hidden peer"
            />
            <div
              className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card/30 group-hover:bg-card/50"
              }`}
            >
              <Icon className={`text-2xl mb-2 ${isSelected ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-xs font-bold">{style.label}</span>
            </div>
          </label>
        )
      })}
    </div>
  )
}
