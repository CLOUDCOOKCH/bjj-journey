"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, Settings, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold text-white hover:text-blue-400 transition-colors">
              Jiu-Jitsu Tracker
            </Link>
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`transition-all duration-200 ${
                        isActive
                          ? "bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 hover:text-blue-300"
                          : "text-slate-300 hover:text-white hover:bg-slate-800/50"
                      }`}
                    >
                      <Icon className="h-4 w-4 mr-2" />
                      {item.label}
                    </Button>
                  </Link>
                )
              })}
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800 transition-all duration-200"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>
    </nav>
  )
}
