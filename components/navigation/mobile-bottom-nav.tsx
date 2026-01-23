"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, BookOpen, Plus, User } from "lucide-react"

const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/settings", label: "Profile", icon: User },
]

export function MobileBottomNav() {
  const pathname = usePathname()

  return (
    <div
      className="lg:hidden fixed bottom-0 left-0 w-full h-16 bg-card/90 backdrop-blur-lg border-t border-border flex items-center justify-around px-4 z-50"
      style={{ viewTransitionName: 'mobile-nav' } as React.CSSProperties}
    >
      {navItems.map((item) => {
        const Icon = item.icon
        const isActive = pathname === item.href
        return (
          <Link key={item.href} href={item.href} className="flex flex-col items-center gap-1">
            <Icon className={`text-xl ${isActive ? "text-primary" : "text-muted-foreground"}`} />
            <span className={`text-[10px] font-bold ${isActive ? "text-primary" : "text-muted-foreground"}`}>
              {item.label}
            </span>
          </Link>
        )
      })}

      {/* Center FAB for quick add */}
      <Link href="/start-training" className="-mt-8 w-14 h-14 bg-primary rounded-full flex items-center justify-center shadow-lg shadow-primary/20 hover:scale-110 active:scale-95 transition-all">
        <Plus className="text-foreground text-2xl" />
      </Link>
    </div>
  )
}
