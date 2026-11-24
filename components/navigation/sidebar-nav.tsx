"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LogOut, Shield } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { isActiveRoute, primaryNav, secondaryNav } from "./items"

interface SidebarNavProps {
  belt?: string
  name?: string
}

export function SidebarNav({ belt, name }: SidebarNavProps) {
  const pathname = usePathname()
  const { data: session } = useSession()
  const athlete = name || session?.user?.name || "Athlete"

  function renderLinks(items: typeof primaryNav | typeof secondaryNav) {
    return items.map(({ href, label, icon: Icon }) => {
      const active = isActiveRoute(pathname, href)
      return <Link key={href} href={href} aria-current={active ? "page" : undefined}
        className={cn("flex min-h-10 items-center gap-3 rounded-lg px-3 py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring",
          active ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground")}>
        <Icon className="size-4 shrink-0" aria-hidden="true" /> {label}
      </Link>
    })
  }

  return (
    <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r bg-sidebar lg:flex"
      style={{ viewTransitionName: "sidebar" } as React.CSSProperties}>
      <div className="border-b px-5 py-5">
        <Link href="/dashboard" className="inline-flex items-center gap-2.5 rounded focus-visible:outline-2 focus-visible:outline-ring">
          <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"><Shield className="size-5" aria-hidden="true" /></span>
          <span className="text-base font-bold tracking-tight text-sidebar-foreground">BJJ Journey</span>
        </Link>
      </div>
      <nav aria-label="Main navigation" className="flex-1 space-y-2 overflow-y-auto px-3 py-3">
        <div className="space-y-0.5">{renderLinks(primaryNav)}</div>
        <div className="space-y-0.5 border-t pt-2">{renderLinks(secondaryNav)}</div>
      </nav>
      <div className="space-y-1 border-t p-3">
        <Link className="flex min-w-0 items-center gap-3 rounded-lg p-2 hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring" href="/settings">
          <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary" aria-hidden="true">{athlete[0]?.toUpperCase()}</span>
          <span className="min-w-0 text-sm"><span className="block truncate font-medium">{athlete}</span><span className="block truncate text-xs capitalize text-muted-foreground">{belt ?? "White"} Belt</span></span>
        </Link>
        <Button variant="ghost" className="w-full justify-start text-muted-foreground" onClick={() => void signOut({ callbackUrl: "/auth/login" })}>
          <LogOut /> Sign out
        </Button>
      </div>
    </aside>
  )
}
