"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Trophy, AwardIcon, Trash2 } from "lucide-react"
import { AddAchievementDialog } from "@/components/add-achievement-dialog"
import { useDeleteAchievement, achievementKeys } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import { formatDateString } from "@/lib/utils/date"

interface Achievement {
  id: string
  type: string
  title: string
  description: string | null
  achievedDate: string
}

interface AchievementsListProps {
  achievements: Achievement[]
  userId: string
}

export function AchievementsList({ achievements, userId }: AchievementsListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const queryClient = useQueryClient()
  const deleteAchievement = useDeleteAchievement({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
    },
  })

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this achievement?")) return

    try {
      await deleteAchievement.mutateAsync(id)
    } catch (error) {
      console.error("Error deleting achievement:", error)
      alert(error instanceof Error ? error.message : "Failed to delete achievement. Please try again.")
    }
  }

  const getAchievementIcon = (type: string) => {
    return type === "belt" ? Trophy : AwardIcon
  }

  const getAchievementColor = (type: string) => {
    return type === "belt"
      ? "bg-yellow-600/20 border-yellow-500/50 text-yellow-400"
      : "bg-purple-600/20 border-purple-500/50 text-purple-400"
  }

  return (
    <>
      <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm animate-in fade-in slide-in-from-bottom-12 duration-700 delay-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Achievements</CardTitle>
              <CardDescription className="text-slate-400">
                Track your belt promotions, stripes, and other milestones
              </CardDescription>
            </div>
            <Button onClick={() => setIsDialogOpen(true)} className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Add Achievement
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {achievements.length === 0 ? (
            <div className="text-center py-12">
              <Trophy className="h-12 w-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No achievements yet. Add your first milestone!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {achievements.map((achievement) => {
                const Icon = getAchievementIcon(achievement.type)
                const colorClass = getAchievementColor(achievement.type)

                return (
                  <div
                    key={achievement.id}
                    className={`
                      p-4 rounded-lg border-2 transition-all duration-200 hover:scale-102
                      ${colorClass}
                    `}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0 mt-1">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex-1">
                            <h4 className="text-lg font-semibold text-white">{achievement.title}</h4>
                            <p className="text-sm text-slate-300 mt-1">
                              {formatDateString(achievement.achievedDate, {
                                month: "long",
                                day: "numeric",
                                year: "numeric",
                              })}
                            </p>
                            {achievement.description && (
                              <p className="text-sm text-slate-400 mt-2">{achievement.description}</p>
                            )}
                          </div>
                          <Button
                            onClick={() => handleDelete(achievement.id)}
                            size="icon"
                            variant="ghost"
                            disabled={deleteAchievement.isPending}
                            className="text-red-400 hover:text-red-300 hover:bg-red-950/30"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <AddAchievementDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)} userId={userId} />
    </>
  )
}
