"use client"

import { Card } from "@/components/ui/card"
import { Target } from "lucide-react"
import { BELT_ORDER, getNextBelt, TIME_REQUIREMENTS, BELT_COLORS, type BeltRank } from "@/lib/constants/belt-progression"

interface NextRankRequirementsProps {
  currentBelt: string
  currentStripes: number
  sessionsSincePromotion: number
}

export function NextRankRequirements({
  currentBelt,
  currentStripes,
  sessionsSincePromotion
}: NextRankRequirementsProps) {
  const nextBelt = getNextBelt(currentBelt as BeltRank)
  const typedCurrentBelt = currentBelt as BeltRank

  // If already at max stripes, show next belt requirements
  // Otherwise show stripe requirements
  const showNextBelt = currentStripes >= 4 || !nextBelt

  const requirements = showNextBelt && nextBelt
    ? {
        title: `${BELT_COLORS[nextBelt].name} Requirements`,
        items: [
          {
            label: "Minimum Time",
            value: `${TIME_REQUIREMENTS[typedCurrentBelt].minMonths} months`,
          },
          {
            label: "Training Sessions",
            value: `~${TIME_REQUIREMENTS[typedCurrentBelt].typicalSessions} sessions`,
          },
          {
            label: "Your Progress",
            value: `${sessionsSincePromotion} sessions`,
            showProgress: true,
            total: TIME_REQUIREMENTS[typedCurrentBelt].typicalSessions,
          },
        ],
      }
    : {
        title: "Next Stripe Requirements",
        items: [
          {
            label: "Stripes Earned",
            value: `${currentStripes}/4`,
          },
          {
            label: "Sessions Until Stripe",
            value: `${Math.max(0, 35 - (sessionsSincePromotion % 35))} sessions`,
          },
        ],
      }

  return (
    <Card className="glass-card p-4 lg:p-6 rounded-2xl">
      <h2 className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2 mb-4 lg:mb-6">
        <Target className="w-5 h-5 text-primary" />
        {requirements.title}
      </h2>

      <div className="space-y-4">
        {requirements.items.map((item) => (
          <div key={item.label}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">{item.label}</span>
              <span className="text-sm font-bold text-foreground">{item.value}</span>
            </div>
            {/* Progress bar for visual indicator */}
            {item.showProgress && item.total && (
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(
                      (sessionsSincePromotion / item.total) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mt-4 lg:mt-6 p-3 lg:p-4 bg-primary/5 rounded-xl border border-primary/20">
        <p className="text-xs text-muted-foreground leading-relaxed">
          <strong className="text-primary">Tip:</strong> Progress requirements vary by instructor.
          Focus on consistent training and technical mastery rather than just session counts.
        </p>
      </div>
    </Card>
  )
}
