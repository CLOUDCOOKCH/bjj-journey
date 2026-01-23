"use client"

import Link from "next/link"
import { Plus, Video, CalendarDays } from "lucide-react"

const actions = [
  {
    label: "Start New Session",
    icon: Plus,
    href: "/start-training",
    variant: "primary" as const,
  },
  {
    label: "Add Technique",
    icon: Video,
    href: "/calendar?action=new&type=technique",
    variant: "glass" as const,
  },
  {
    label: "Full Calendar",
    icon: CalendarDays,
    href: "/calendar",
    variant: "glass" as const,
  },
]

export function QuickActions() {
  return (
    <section className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-100">
      <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {actions.map((action) => {
          const Icon = action.icon

          return (
            <Link key={action.label} href={action.href}>
              <button
                className={`
                  w-full h-auto py-4 px-6 rounded-2xl
                  transition-all shadow-lg
                  hover:scale-[1.02] active:scale-95
                  flex items-center justify-center gap-3
                  ${
                    action.variant === "primary"
                      ? "bg-primary hover:bg-primary/90 text-primary-foreground font-bold shadow-primary/10 hover:shadow-xl"
                      : "bg-card/40 backdrop-blur-md border-border/50 text-foreground font-semibold hover:bg-card/60"
                  }
                `}
              >
                <Icon className={`text-xl ${action.variant === "glass" ? "text-primary" : ""}`} />
                <span>{action.label}</span>
              </button>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
