"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, Calendar, BookOpen, Video, Award, Target, Shield } from "lucide-react"
import { useSession } from "next-auth/react"

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", icon: Calendar },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/techniques", label: "Techniques", icon: Video },
  { href: "/achievements", label: "Achievements", icon: Award },
  { href: "/goals", label: "Goals", icon: Target },
]

interface SidebarNavProps {
  belt?: string
}

export function SidebarNav({ belt }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()

  return (
    <aside className="fixed left-0 top-0 hidden lg:flex h-full w-64 flex-col border-r border-border bg-card/50 backdrop-blur-xl z-50">
      {/* Logo */}
      <div className="p-8">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center shadow-[0_0_15px_-3px_rgba(45,212,191,0.4)]">
            <Shield className="text-white text-xl" />
          </div>
          <span className="text-lg font-bold tracking-tight text-foreground">JJ JOURNAL</span>
        </Link>
      </div>

      {/* Nav Items */}
      <nav className="mt-4 flex-1 space-y-2 px-4">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href}>
              <div className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                isActive
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground"
              }`}>
                <Icon className="text-xl transition-colors group-hover:text-primary" />
                {item.label}
              </div>
            </Link>
          )
        })}
      </nav>

      {/* User Menu */}
      <div className="p-6">
        <div className="glass-card p-4 rounded-2xl flex items-center gap-3">
          <div className="w-10 h-10 rounded-full border border-primary/20 bg-accent flex items-center justify-center text-sm font-bold text-foreground">
            {session?.user?.name?.[0] || "U"}
          </div>
          <div className="flex flex-col overflow-hidden">
            <p className="text-xs font-semibold text-foreground truncate">{session?.user?.name || "Athlete"}</p>
            <p className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {belt ? `${belt} Belt` : "White Belt"}
            </p>
          </div>
        </div>
      </div>
    </aside>
  )
}
