"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { useRouter } from "next/navigation"
import { Target } from "lucide-react"

interface FrequencyGoalSettingsProps {
  currentGoal: number
  userId: string
}

export function FrequencyGoalSettings({ currentGoal, userId }: FrequencyGoalSettingsProps) {
  const [goal, setGoal] = useState(currentGoal)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const res = await fetch("/api/profiles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthlyGoal: goal }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to update goal")
      }

      router.refresh()
    } catch (error) {
      console.error("Error updating goal:", error)
      alert("Failed to update goal. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-400" />
          <CardTitle className="text-white">Monthly Training Goal</CardTitle>
        </div>
        <CardDescription className="text-slate-400">
          Set your target number of training sessions per month
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label htmlFor="goal" className="text-slate-200">
            Sessions per Month
          </Label>
          <div className="flex items-center gap-4">
            <Input
              id="goal"
              type="number"
              min="1"
              max="31"
              value={goal}
              onChange={(e) => setGoal(Number.parseInt(e.target.value) || 1)}
              className="bg-slate-800/50 border-slate-700 text-white w-24 text-center text-2xl font-bold"
            />
            <div className="flex-1">
              <div className="text-sm text-slate-400">
                {goal <= 4 && "Light training schedule"}
                {goal > 4 && goal <= 8 && "Balanced training schedule"}
                {goal > 8 && goal <= 12 && "Dedicated practitioner"}
                {goal > 12 && goal <= 20 && "Serious competitor"}
                {goal > 20 && "Elite athlete level"}
              </div>
            </div>
          </div>
        </div>

        {goal !== currentGoal && (
          <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              {isLoading ? "Saving..." : "Save Goal"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
