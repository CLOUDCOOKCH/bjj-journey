"use client"

interface IntensityLevelBarProps {
  value: number
  onChange: (value: number) => void
}

const levels = [1, 2, 3, 4, 5]
const levelLabels = ["LIGHT", "MODERATE", "CHALLENGING", "INTENSE", "WAR"]

export function IntensityLevelBar({ value, onChange }: IntensityLevelBarProps) {
  const heights = ["20%", "40%", "60%", "80%", "100%"]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-end h-16 gap-1">
        {levels.map((level) => {
          const isSelected = value === level
          const isActive = level <= value

          return (
            <button
              key={level}
              type="button"
              onClick={() => onChange(level)}
              className={`w-full rounded-t-sm transition-all hover:bg-primary/50 cursor-pointer ${
                isSelected
                  ? "bg-primary shadow-[0_-5px_15px_rgba(45,212,191,0.2)]"
                  : isActive
                  ? "bg-primary/40"
                  : "bg-border"
              }`}
              style={{ height: heights[level - 1] }}
            />
          )
        })}
      </div>
      <div className="flex justify-between px-1">
        <span className={`text-[10px] font-bold ${value === 1 ? "text-primary" : "text-muted-foreground"}`}>
          {levelLabels[0]}
        </span>
        <span className={`text-[10px] font-bold ${value === 3 ? "text-primary" : "text-muted-foreground"}`}>
          {levelLabels[2]}
        </span>
        <span className={`text-[10px] font-bold ${value === 5 ? "text-primary" : "text-muted-foreground"}`}>
          {levelLabels[4]}
        </span>
      </div>
    </div>
  )
}
