"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Award, Trash2, Medal } from "lucide-react"
import { BELT_COLORS, type BeltRank } from "@/lib/constants/belt-progression"
import type { Achievement } from "@/lib/db/schema"

interface AchievementTimelineProps {
  achievements: Achievement[]
  onDelete?: (id: string) => void
}

// Helper to extract belt info from achievement title
function parseBeltInfo(title: string, type: string) {
  const lowerTitle = title.toLowerCase()

  if (type === 'belt') {
    // Find which belt is mentioned in the title
    const belt = Object.keys(BELT_COLORS).find((b) =>
      lowerTitle.includes(b)
    ) as BeltRank | undefined
    return { belt: belt || null, stripe: null }
  } else {
    // For stripes, extract the stripe number
    const match = lowerTitle.match(/(\d+)(?:st|nd|rd|th)?\s+stripe/)
    const stripeNumber = match ? parseInt(match[1]) : null

    // Also try to find which belt this stripe is for
    const belt = Object.keys(BELT_COLORS).find((b) =>
      lowerTitle.includes(b)
    ) as BeltRank | undefined

    return { belt: belt || null, stripe: stripeNumber }
  }
}

// Visual belt component with stripes
function VisualBelt({
  belt,
  stripes,
  size = "md"
}: {
  belt: BeltRank,
  stripes?: number | null
  size?: "sm" | "md" | "lg"
}) {
  const colors = BELT_COLORS[belt]

  // Size definitions
  const sizeClasses = {
    sm: "h-4 w-20",
    md: "h-6 w-28",
    lg: "h-8 w-36"
  }

  // Rank bar color (Red for black belt, Black for others)
  const rankBarColor = belt === 'black' ? 'bg-red-600' : 'bg-slate-900'
  const rankBarBorder = belt === 'black' ? 'border-red-700' : 'border-black'

  return (
    <div className="flex items-center gap-3">
      <div
        className={`relative flex overflow-hidden rounded-sm shadow-md border ${colors.border} ${sizeClasses[size]}`}
      >
        {/* Main Belt Color Section */}
        <div className={`flex-grow ${colors.bg}`} />

        {/* Rank Bar Section */}
        <div className={`w-[25%] ${rankBarColor} border-l ${rankBarBorder} flex items-center justify-around px-0.5`}>
          {stripes !== null && stripes !== undefined && stripes > 0 && Array.from({ length: stripes }, (_, i) => (
            <div
              key={i}
              className="h-[80%] w-[2px] bg-white rounded-full shadow-[0_0_2px_rgba(255,255,255,0.5)]"
            />
          ))}
        </div>
      </div>

      <span className={`font-bold ${colors.text} ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-sm' : 'text-xs'}`}>
        {colors.name}
        {stripes ? ` • ${stripes} Stripe${stripes > 1 ? 's' : ''}` : ''}
      </span>
    </div>
  )
}

// Timeline icon colors based on belt
const TIMELINE_COLORS: Record<BeltRank, { bg: string; border: string; icon: string }> = {
  white: {
    bg: 'bg-slate-500/10',
    border: 'border-slate-500/30',
    icon: 'text-slate-400'
  },
  blue: {
    bg: 'bg-blue-500/20',
    border: 'border-blue-500/50',
    icon: 'text-blue-400'
  },
  purple: {
    bg: 'bg-purple-500/20',
    border: 'border-purple-500/50',
    icon: 'text-purple-400'
  },
  brown: {
    bg: 'bg-amber-700/20',
    border: 'border-amber-700/50',
    icon: 'text-amber-600'
  },
  black: {
    bg: 'bg-red-900/20',
    border: 'border-red-900/50',
    icon: 'text-red-500'
  },
}

export function AchievementTimeline({ achievements, onDelete }: AchievementTimelineProps) {
  // Sort by date descending
  const sortedAchievements = [...achievements].sort(
    (a, b) => new Date(b.achievedDate).getTime() - new Date(a.achievedDate).getTime()
  )

  if (sortedAchievements.length === 0) {
    return (
      <Card className="glass-card p-6 lg:p-8 rounded-2xl lg:rounded-3xl text-center">
        <Award className="w-12 h-12 lg:w-16 lg:h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
        <h3 className="text-base lg:text-lg font-bold text-foreground mb-2">No Achievements Yet</h3>
        <p className="text-xs lg:text-sm text-muted-foreground max-w-md mx-auto">
          Your first achievement will appear here when you earn your first stripe or belt promotion.
        </p>
      </Card>
    )
  }

  return (
    <Card className="glass-card p-6 lg:p-8 rounded-2xl lg:rounded-3xl">
      <h2 className="text-lg lg:text-xl font-bold text-foreground mb-6">Achievement Timeline</h2>

      <div className="space-y-3 lg:space-y-4">
        {sortedAchievements.map((achievement, index) => {
          const parsed = parseBeltInfo(achievement.title, achievement.type)

          // If it's a stripe but we couldn't parse the belt from the title,
          // look back in history (forward in the sorted array) for the most recent belt
          let beltToUse = parsed.belt
          if (!beltToUse && achievement.type === 'stripe') {
            const previousBelt = sortedAchievements
              .slice(index + 1)
              .find(a => a.type === 'belt')

            if (previousBelt) {
              const prevParsed = parseBeltInfo(previousBelt.title, 'belt')
              beltToUse = prevParsed.belt
            } else {
              // Default to white belt if no previous belt found
              beltToUse = 'white'
            }
          }

          // Determine styles for the timeline indicator
          const styles = beltToUse
            ? TIMELINE_COLORS[beltToUse]
            : { bg: 'bg-teal-500/20', border: 'border-teal-500/50', icon: 'text-teal-400' }

          return (
            <div
              key={achievement.id}
              className="flex items-start gap-3 lg:gap-4 p-3 lg:p-4 bg-accent/30 rounded-xl border border-border/30 group relative"
            >
              {/* Timeline indicator */}
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 lg:w-10 lg:h-10 rounded-full flex items-center justify-center border-2 shrink-0 ${styles.bg} ${styles.border}`}>
                  <Award className={`w-4 h-4 lg:w-5 lg:h-5 ${styles.icon}`} />
                </div>
                {index < sortedAchievements.length - 1 && (
                  <div className="w-0.5 flex-1 bg-border/30 mt-2 min-h-[2rem]" />
                )}
              </div>

              {/* Achievement details */}
              <div className="flex-1 min-w-0 pr-16">
                {/* Visual representation */}
                <div className="flex items-center gap-3 mb-2">
                  {beltToUse ? (
                    <VisualBelt
                      belt={beltToUse}
                      stripes={parsed.stripe}
                      size="md"
                    />
                  ) : (
                    <span className="text-sm font-bold text-foreground">{achievement.title}</span>
                  )}

                  {achievement.description && (
                    <p className="text-xs lg:text-sm text-muted-foreground line-clamp-2">
                      {achievement.description}
                    </p>
                  )}
                </div>

                <p className="text-xs text-muted-foreground">
                  {new Date(achievement.achievedDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </p>
              </div>

              {/* Delete button */}
              {onDelete && (
                <Button
                  type="button"
                  onClick={() => onDelete(achievement.id)}
                  size="icon"
                  variant="ghost"
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
