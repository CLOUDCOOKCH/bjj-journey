"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface BeltSettingsProps {
  currentBelt: string
  userId: string
}

const belts = [
  { value: "white", label: "White Belt", color: "bg-slate-100", textColor: "text-slate-900" },
  { value: "blue", label: "Blue Belt", color: "bg-blue-600", textColor: "text-white" },
  { value: "purple", label: "Purple Belt", color: "bg-purple-600", textColor: "text-white" },
  { value: "brown", label: "Brown Belt", color: "bg-amber-800", textColor: "text-white" },
  { value: "black", label: "Black Belt", color: "bg-slate-900", textColor: "text-white" },
]

export function BeltSettings({ currentBelt, userId }: BeltSettingsProps) {
  const [selectedBelt, setSelectedBelt] = useState(currentBelt)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          belt: selectedBelt,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error updating belt:", error)
      alert("Failed to update belt. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">
      <CardHeader>
        <CardTitle className="text-white">Current Belt Rank</CardTitle>
        <CardDescription className="text-slate-400">Update your current belt rank</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label className="text-slate-200">Select Belt</Label>
          <div className="grid gap-3">
            {belts.map((belt) => (
              <button
                key={belt.value}
                onClick={() => setSelectedBelt(belt.value)}
                className={`
                  flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200
                  ${
                    selectedBelt === belt.value
                      ? "border-blue-500 bg-blue-600/20 scale-105"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600 hover:bg-slate-800/50"
                  }
                `}
              >
                <div className={`w-20 h-10 ${belt.color} rounded border-2 border-slate-700 shadow-lg`} />
                <span className="text-lg font-semibold text-white">{belt.label}</span>
                {selectedBelt === belt.value && (
                  <div className="ml-auto flex items-center justify-center w-6 h-6 bg-blue-600 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {selectedBelt !== currentBelt && (
          <div className="pt-4 border-t border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-200"
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
