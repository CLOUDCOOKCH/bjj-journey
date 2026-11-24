"use client"

import { Card } from "@/components/ui/card"
import { Check, Lock } from "lucide-react"
import { BELT_ORDER, BELT_COLORS } from "@/lib/constants/belt-progression"
import type { Achievement } from "@/lib/db/schema"

interface BeltProgressionPathProps {
  currentBelt: string
  currentStripes: number
  achievements: Achievement[]
}

export function BeltProgressionPath({ currentBelt, currentStripes, achievements }: BeltProgressionPathProps) {
  // Get belt promotion achievements
  const beltAchievements = achievements
    .filter(a => a.type === 'belt')
    .sort((a, b) => new Date(a.achievedDate).getTime() - new Date(b.achievedDate).getTime())

  const currentBeltIndex = BELT_ORDER.findIndex((belt) => belt === currentBelt)

  return (
    <Card className="glass-card p-6 lg:p-8 rounded-2xl lg:rounded-3xl">
      <h2 className="text-lg lg:text-xl font-bold text-foreground mb-6">Belt Progression</h2>

      <div className="relative">
        {/* Progress line */}
        <div className="absolute left-6 top-12 bottom-12 w-0.5 bg-border/30" />

        <div className="space-y-0">
          {BELT_ORDER.map((belt, index) => {
            const isAchieved = index <= currentBeltIndex
            const isCurrent = index === currentBeltIndex
            const isNext = index === currentBeltIndex + 1
            const promotionDate = beltAchievements.find(a =>
              a.title.toLowerCase().includes(belt)
            )?.achievedDate

            const colors = BELT_COLORS[belt]

            return (
              <div key={belt} className="relative flex items-center gap-4 pb-8 last:pb-0">
                {/* Belt icon/circle */}
                <div className={`
                  relative z-10 w-12 h-12 rounded-full flex items-center justify-center
                  ${colors.bg} ${colors.border} border-2 shrink-0
                  ${isCurrent ? 'ring-4 ring-primary/50 shadow-[0_0_20px_rgba(45,212,191,0.3)]' : ''}
                  ${!isAchieved ? 'opacity-40' : ''}
                  transition-all duration-300
                `}>
                  {isAchieved ? (
                    <Check className={`w-6 h-6 ${colors.text}`} />
                  ) : (
                    <Lock className={`w-5 h-5 ${colors.text}`} />
                  )}
                </div>

                {/* Belt info */}
                <div className="flex-1 glass-card p-3 lg:p-4 rounded-xl">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <h3 className={`
                        font-bold uppercase tracking-wider text-sm lg:text-base
                        ${isCurrent ? 'text-primary' : isAchieved ? 'text-foreground' : 'text-muted-foreground'}
                      `}>
                        {colors.name}
                        {isCurrent && currentStripes > 0 && (
                          <span className="ml-2 text-xs lg:text-sm font-normal">
                            {' '}• {currentStripes}/4 Stripes
                          </span>
                        )}
                      </h3>
                      {promotionDate && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Achieved {new Date(promotionDate).toLocaleDateString('en-US', {
                            month: 'long',
                            year: 'numeric'
                          })}
                        </p>
                      )}
                      {isNext && (
                        <p className="text-xs text-primary font-medium mt-1">
                          Next rank
                        </p>
                      )}
                    </div>

                    {/* Stripe indicators for current belt */}
                    {isCurrent && (
                      <div className="flex gap-1 shrink-0">
                        {[0, 1, 2, 3].map((stripe) => (
                          <div
                            key={stripe}
                            className={`
                              w-3 h-3 rounded-full
                              ${stripe < currentStripes
                                ? 'bg-primary shadow-[0_0_8px_rgba(45,212,191,0.6)]'
                                : 'bg-muted-foreground/30'}
                            `}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </Card>
  )
}
