"use client"

import { Bell, Settings } from "lucide-react"
import Link from "next/link"

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 flex h-20 items-center justify-between px-4 lg:px-8 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div>
        <h1 className="text-xl lg:text-2xl font-bold text-foreground">Training Dashboard</h1>
        <p className="text-xs lg:text-sm text-muted-foreground font-medium">
          Welcome back, {userName || "Athlete"}. Oss!
        </p>
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 text-muted-foreground hover:text-primary transition-colors relative" aria-label="Notifications">
          <Bell className="text-xl" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
        </button>
        <Link href="/settings" className="p-2 text-muted-foreground hover:text-primary transition-colors" aria-label="Settings">
          <Settings className="text-xl" />
        </Link>
      </div>
    </header>
  )
}
