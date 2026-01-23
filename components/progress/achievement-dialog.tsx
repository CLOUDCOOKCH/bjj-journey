"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Award, Check } from "lucide-react"
import { useQueryClient } from "@tanstack/react-query"
import { useCreateAchievement, achievementKeys } from "@/lib/hooks"
import { BELT_COLORS, type BeltRank } from "@/lib/constants/belt-progression"
import type { Achievement } from "@/lib/db/schema"
import { ButtonLoader } from "@/components/loading/button-loader"

interface AchievementDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  existingAchievement?: Achievement
}

export function AchievementDialog({ isOpen, onClose, userId, existingAchievement }: AchievementDialogProps) {
  const [type, setType] = useState<"belt" | "stripe">("belt")
  const [selectedBelt, setSelectedBelt] = useState<BeltRank | null>(null)
  const [stripeNumber, setStripeNumber] = useState<number>(1)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [achievedDate, setAchievedDate] = useState("")

  const queryClient = useQueryClient()
  const createAchievement = useCreateAchievement({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: achievementKeys.lists() })
    },
  })

  useEffect(() => {
    if (existingAchievement) {
      setType(existingAchievement.type as "belt" | "stripe")
      setTitle(existingAchievement.title)
      setDescription(existingAchievement.description || "")
      setAchievedDate(existingAchievement.achievedDate)

      // Try to extract belt/stripe info from title
      if (existingAchievement.type === "belt") {
        const belt = Object.keys(BELT_COLORS).find(b =>
          existingAchievement.title.toLowerCase().includes(b)
        ) as BeltRank | undefined
        if (belt) setSelectedBelt(belt)
      } else if (existingAchievement.type === "stripe") {
        const match = existingAchievement.title.match(/(\d+)(?:st|nd|rd|th)?\s+stripe/i)
        if (match) setStripeNumber(parseInt(match[1]))
      }
    } else {
      setType("belt")
      setSelectedBelt(null)
      setStripeNumber(1)
      setTitle("")
      setDescription("")
      // Default to today
      const today = new Date()
      const dateStr = today.toISOString().split('T')[0]
      setAchievedDate(dateStr)
    }
  }, [existingAchievement, isOpen])

  // Auto-populate title when belt or stripe selection changes
  useEffect(() => {
    if (!existingAchievement) {
      if (type === "belt" && selectedBelt) {
        setTitle(`${BELT_COLORS[selectedBelt].name} Promotion`)
      } else if (type === "stripe") {
        const ordinal = stripeNumber === 1 ? "1st" : stripeNumber === 2 ? "2nd" : stripeNumber === 3 ? "3rd" : "4th"
        setTitle(`${ordinal} Stripe Award`)
      }
    }
  }, [type, selectedBelt, stripeNumber, existingAchievement])

  const handleSave = async () => {
    if (!title.trim() || !achievedDate) {
      alert("Please fill in all required fields")
      return
    }

    if (type === "belt" && !selectedBelt) {
      alert("Please select a belt color")
      return
    }

    try {
      await createAchievement.mutateAsync({
        type,
        title: title.trim(),
        description: description.trim() || null,
        achievedDate,
      })

      onClose()
    } catch (error) {
      console.error("Error saving achievement:", error)
      alert(error instanceof Error ? error.message : "Failed to save achievement. Please try again.")
    }
  }

  const isLoading = createAchievement.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-border bg-background/95 backdrop-blur-xl text-foreground max-w-md max-h-[90vh] overflow-y-auto sm:rounded-2xl shadow-2xl shadow-primary/10">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Award className="w-5 h-5 text-primary" />
            {existingAchievement ? "Edit Achievement" : "Add Achievement"}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="type" className="text-foreground font-medium">
              Type <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setType("belt")}
                className={`
                  flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium
                  ${type === "belt"
                    ? "border-purple-500 bg-purple-500/20 text-purple-400"
                    : "border-border bg-background/50 text-muted-foreground hover:border-purple-500/50"}
                `}
              >
                Belt Promotion
              </button>
              <button
                type="button"
                onClick={() => setType("stripe")}
                className={`
                  flex-1 py-2 px-4 rounded-lg border-2 transition-all font-medium
                  ${type === "stripe"
                    ? "border-teal-500 bg-teal-500/20 text-teal-400"
                    : "border-border bg-background/50 text-muted-foreground hover:border-teal-500/50"}
                `}
              >
                Stripe
              </button>
            </div>
          </div>

          {type === "belt" ? (
            <div className="space-y-2">
              <Label className="text-foreground font-medium">
                Belt Color <span className="text-destructive">*</span>
              </Label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(BELT_COLORS) as BeltRank[]).map((belt) => {
                  const colors = BELT_COLORS[belt]
                  const isSelected = selectedBelt === belt

                  return (
                    <button
                      key={belt}
                      type="button"
                      onClick={() => setSelectedBelt(belt)}
                      className={`
                        relative py-3 px-4 rounded-xl border-2 transition-all font-medium flex items-center justify-center gap-2
                        ${isSelected
                          ? `${colors.border} ${colors.bg} ${colors.text} ring-2 ring-primary/50 shadow-lg`
                          : "border-border bg-background/50 text-muted-foreground hover:border-primary/30"}
                      `}
                    >
                      <div className={`w-4 h-4 rounded-full border border-white/30 ${colors.bg}`} />
                      <span>{colors.name}</span>
                      {isSelected && (
                        <Check className="w-4 h-4 ml-auto" />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="stripe" className="text-foreground font-medium">
                Stripe Number <span className="text-destructive">*</span>
              </Label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setStripeNumber(num)}
                    className={`
                      flex-1 py-3 px-4 rounded-xl border-2 transition-all font-bold text-lg
                      ${stripeNumber === num
                        ? "border-teal-500 bg-teal-500/20 text-teal-400 ring-2 ring-teal-500/50 shadow-lg"
                        : "border-border bg-background/50 text-muted-foreground hover:border-teal-500/50"}
                    `}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="title" className="text-foreground font-medium">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="title"
              placeholder={type === "belt" ? "Blue Belt Promotion" : "3rd Stripe Award"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Auto-filled based on your selection, but you can edit it
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-foreground font-medium">
              Date Achieved <span className="text-destructive">*</span>
            </Label>
            <Input
              id="date"
              type="date"
              value={achievedDate}
              onChange={(e) => setAchievedDate(e.target.value)}
              className="bg-background/50 border-input text-foreground"
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-foreground font-medium">
              Description (optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add details about this achievement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-background/50 border-input text-foreground placeholder:text-muted-foreground min-h-[80px]"
            />
          </div>
        </div>

        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={onClose}
            variant="ghost"
            disabled={isLoading}
            className="text-muted-foreground hover:text-foreground"
          >
            Cancel
          </Button>
          {isLoading ? (
            <ButtonLoader text="Saving..." className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20" />
          ) : (
            <Button
              type="button"
              onClick={handleSave}
              className="bg-primary text-primary-foreground hover:bg-primary/90 transition-all duration-200 shadow-lg shadow-primary/20"
            >
              Save Achievement
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
