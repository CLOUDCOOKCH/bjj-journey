"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Ellipsis, LogOut, Plus } from "lucide-react"
import { signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger, SheetClose } from "@/components/ui/sheet"
import { cn } from "@/lib/utils"
import { isActiveRoute, primaryNav, secondaryNav } from "./items"

export function MobileBottomNav() {
  const pathname = usePathname()
  const moreActive = secondaryNav.some(({ href }) => isActiveRoute(pathname, href))
  const itemClass = "flex min-h-12 min-w-12 flex-col items-center justify-center gap-1 rounded-md text-[0.65rem] font-medium focus-visible:outline-2 focus-visible:outline-ring"

  return (
    <nav aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-50 flex justify-around border-t bg-card/95 px-1 pb-[max(0.25rem,env(safe-area-inset-bottom))] pt-0.5 backdrop-blur-md lg:hidden"
      style={{ viewTransitionName: "mobile-nav" } as React.CSSProperties}>
      {primaryNav.map(({ href, mobileLabel, icon: Icon }) => {
        const active = isActiveRoute(pathname, href)
        return <Link key={href} href={href} aria-current={active ? "page" : undefined}
          className={cn(itemClass, active ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
          <Icon className="size-5" aria-hidden="true" /> {mobileLabel}
        </Link>
      })}
      <Sheet>
        <SheetTrigger asChild>
          <button type="button" className={cn(itemClass, moreActive ? "text-primary" : "text-muted-foreground hover:text-foreground")}>
            <Ellipsis className="size-5" aria-hidden="true" /> More
          </button>
        </SheetTrigger>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto pb-[max(1rem,env(safe-area-inset-bottom))]">
          <SheetHeader>
            <SheetTitle>BJJ Journey</SheetTitle>
            <SheetDescription className="sr-only">Additional training and account pages</SheetDescription>
          </SheetHeader>
          <div className="grid gap-1 px-4 pb-3">
            <SheetClose asChild><Button asChild className="justify-start"><Link href="/start-training"><Plus /> Log mat session</Link></Button></SheetClose>
            {secondaryNav.map(({ href, label, icon: Icon }) => <SheetClose asChild key={href}>
              <Link href={href} aria-current={isActiveRoute(pathname, href) ? "page" : undefined}
                className={cn("flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring",
                  isActiveRoute(pathname, href) ? "bg-primary/10 text-primary" : "hover:bg-muted")}>
                <Icon className="size-4" aria-hidden="true" /> {label}
              </Link>
            </SheetClose>)}
            <Button variant="ghost" className="min-h-11 justify-start" onClick={() => void signOut({ callbackUrl: "/auth/login" })}><LogOut /> Sign out</Button>
          </div>
        </SheetContent>
      </Sheet>
    </nav>
  )
}
