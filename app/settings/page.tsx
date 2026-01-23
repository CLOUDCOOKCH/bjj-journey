import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"
import { BeltSettings } from "@/components/belt-settings"
import { FrequencyGoalSettings } from "@/components/frequency-goal-settings"

export default async function SettingsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    redirect("/auth/login")
  }

  const userId = session.user.id

  // Get cookies to pass to API routes
  const cookieStore = await cookies()
  const cookieHeader = Array.from(cookieStore.getAll())
    .map(cookie => `${cookie.name}=${cookie.value}`)
    .join('; ')

  // Fetch data from API
  const profileRes = await fetch(`${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/profiles`, {
    cache: 'no-store',
    headers: {
      cookie: cookieHeader,
    },
  })

  if (!profileRes.ok) {
    throw new Error('Failed to fetch data')
  }

  const profile = await profileRes.json()

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <h1 className="text-4xl font-bold text-foreground mb-2">Settings</h1>
            <p className="text-muted-foreground">Manage your belt rank and training goals</p>
          </div>

          <div className="space-y-6">
            <BeltSettings currentBelt={profile?.belt || "white"} userId={userId} />
            <FrequencyGoalSettings currentGoal={profile?.monthlyGoal || 12} userId={userId} />
          </div>
        </div>
      </main>
    </div>
  )
}
