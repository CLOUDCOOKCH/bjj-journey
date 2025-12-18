import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AppNav } from "@/components/app-nav"
import { BeltSettings } from "@/components/belt-settings"
import { AchievementsList } from "@/components/achievements-list"
import { FrequencyGoalSettings } from "@/components/frequency-goal-settings"

export default async function SettingsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*", { count: "exact" }).eq("id", user.id).single()

  // Fetch achievements
  const { data: achievements } = await supabase
    .from("achievements")
    .select("*")
    .eq("user_id", user.id)
    .order("achieved_date", { ascending: false })

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <AppNav />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <h1 className="text-4xl font-bold text-white mb-2">Settings</h1>
          <p className="text-slate-400">Manage your belt rank and track your achievements</p>
        </div>

        <div className="space-y-6">
          <BeltSettings currentBelt={profile?.belt || "white"} userId={user.id} />
          <FrequencyGoalSettings currentGoal={profile?.monthly_goal || 12} userId={user.id} />
          <AchievementsList achievements={achievements || []} userId={user.id} />
        </div>
      </main>
    </div>
  )
}
