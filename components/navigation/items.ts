import {
  Activity, Award, BookOpen, CalendarDays, Plus, Flag, HeartPulse,
  LayoutDashboard, Settings, Video,
} from "lucide-react"

export const primaryNav = [
  { href: "/dashboard", label: "Dashboard", mobileLabel: "Home", icon: LayoutDashboard },
  { href: "/calendar", label: "Calendar", mobileLabel: "Calendar", icon: CalendarDays },
  { href: "/start-training", label: "Log mat session", mobileLabel: "Log", icon: Plus },
  { href: "/journal", label: "BJJ journal", mobileLabel: "BJJ", icon: BookOpen },
]

export const secondaryNav = [
  { href: "/techniques", label: "Technique library", icon: Video },
  { href: "/recovery", label: "Recovery", icon: HeartPulse },
  { href: "/progress", label: "Progress", icon: Activity },
  { href: "/achievements", label: "Belt progression", icon: Award },
  { href: "/competitions", label: "Competitions", icon: Flag },
  { href: "/settings", label: "Settings", icon: Settings },
]

export function isActiveRoute(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/")
}
