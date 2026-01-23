"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Calendar, LayoutDashboard, Settings, LogOut, Menu } from "lucide-react"
import { signOut } from "next-auth/react"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { useState } from "react"

export function AppNav() {
  const pathname = usePathname()
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/auth/login" })
  }

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/calendar", label: "Calendar", icon: Calendar },
    { href: "/settings", label: "Settings", icon: Settings },
  ]

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border bg-background/60 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Jiu-Jitsu Journey
            </Link>
            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-2">
              {navItems.map((item) => {
                const Icon = item.icon
                const isActive = pathname === item.href
                return (
                  <Link key={item.href} href={item.href}>
                    <Button
                      variant="ghost"
                      className={`transition-all duration-200 ${isActive
                          ? "bg-primary/10 text-primary hover:bg-primary/20 hover:text-primary"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
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

          <div className="flex items-center gap-4">
            <Button
              onClick={handleLogout}
              variant="outline"
              className="hidden md:flex border-border bg-card/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30 transition-all duration-200"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>

            {/* Mobile Nav */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden text-foreground hover:bg-accent/50">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
                <div className="flex flex-col gap-6 py-6">
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="text-lg font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
                  >
                    Jiu-Jitsu Journey
                  </Link>
                  <div className="flex flex-col gap-2">
                    {navItems.map((item) => {
                      const Icon = item.icon
                      const isActive = pathname === item.href
                      return (
                        <Link key={item.href} href={item.href} onClick={() => setIsOpen(false)}>
                          <Button
                            variant="ghost"
                            className={`w-full justify-start text-lg h-12 ${isActive
                                ? "bg-primary/10 text-primary"
                                : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
                              }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
                            {item.label}
                          </Button>
                        </Link>
                      )
                    })}
                  </div>
                  <div className="mt-auto border-t border-border pt-6">
                    <Button
                      onClick={handleLogout}
                      variant="outline"
                      className="w-full justify-start border-border bg-card/50 text-foreground hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
                    >
                      <LogOut className="h-4 w-4 mr-3" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  )
}
