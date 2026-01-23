"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Flame, Trophy } from "lucide-react"
import type { BeltProgressStats } from "@/lib/utils/progress-calculations"

interface BeltStatsCardProps {
  stats: BeltProgressStats
}

export function BeltStatsCard({ stats }: BeltStatsCardProps) {
  const statsItems = [
    {
      label: "Time at Current Belt",
      value: stats.timeAtCurrentBelt,
      icon: Calendar,
    },
    {
      label: "Sessions Since Promotion",
      value: stats.sessionsSincePromotion.toString(),
      icon: Trophy,
    },
    {
      label: "Sessions Until Next Stripe",
      value: stats.sessionsUntilNextStripe.toString(),
      icon: Flame,
    },
  ]

  return (
    <Card className="glass-card p-4 lg:p-6 rounded-2xl space-y-4 lg:space-y-6">
      <h2 className="text-base lg:text-lg font-bold text-foreground flex items-center gap-2">
        <Flame className="w-5 h-5 text-primary" />
        Current Progress
      </h2>

      <div className="space-y-3 lg:space-y-4">
        {statsItems.map((item) => {
          const Icon = item.icon
          return (
            <div
              key={item.label}
              className="flex items-center gap-3 lg:gap-4 p-3 lg:p-4 bg-accent/30 rounded-xl"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-lg lg:text-xl font-bold text-foreground truncate">{item.value}</p>
              </div>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
