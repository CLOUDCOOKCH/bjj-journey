"use client"

import { Card } from "@/components/ui/card"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

interface AchievementCardProps {
  nextAchievement?: {
    title: string
    description: string
    sessionsRemaining: number
  }
}

export function AchievementCard({ nextAchievement }: AchievementCardProps) {
  const defaultData = {
    title: "Keep Training!",
    description: "Continue your journey to unlock new achievements.",
    sessionsRemaining: 0,
  }

  const data = nextAchievement || defaultData

  return (
    <Card className="border-border/50 bg-gradient-to-br from-background via-background to-primary/5 backdrop-blur-md p-6 rounded-3xl relative overflow-hidden group hover:scale-[1.02] transition-all duration-300">
      {/* Background gradient mesh */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

      <div className="relative">
        <div className="flex items-start justify-between mb-6">
          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Trophy className="text-2xl text-primary" />
          </div>
          <span className="text-[10px] font-bold text-muted-foreground bg-muted px-3 py-1.5 rounded-full uppercase tracking-wider">
            Milestone
          </span>
        </div>

        <div>
          <h3 className="text-lg font-bold text-foreground leading-tight mb-2">{data.title}</h3>
          <p className="text-xs text-muted-foreground font-medium leading-relaxed">{data.description}</p>
        </div>

        <Button
          asChild
          className="mt-6 w-full py-3 bg-muted hover:bg-muted/80 text-foreground font-bold uppercase tracking-widest text-xs rounded-xl transition-all"
        >
          <Link href="/settings?tab=achievements">View Path</Link>
        </Button>
      </div>
    </Card>
  )
}
