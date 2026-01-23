"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useRouter } from "next/navigation"

interface AddAchievementDialogProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function AddAchievementDialog({ isOpen, onClose, userId }: AddAchievementDialogProps) {
  const [type, setType] = useState<"belt" | "stripe">("stripe")
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [achievedDate, setAchievedDate] = useState(new Date().toISOString().split("T")[0])
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSave = async () => {
    if (!title.trim()) {
      alert("Please enter a title")
      return
    }

    setIsLoading(true)

    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          title: title.trim(),
          description: description.trim() || null,
          achievedDate: achievedDate,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || "Failed to add achievement")
      }

      router.refresh()
      onClose()
      setTitle("")
      setDescription("")
      setAchievedDate(new Date().toISOString().split("T")[0])
      setType("stripe")
    } catch (error) {
      console.error("Error adding achievement:", error)
      alert("Failed to add achievement. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="border-slate-800 bg-slate-900 text-white">
        <DialogHeader>
          <DialogTitle className="text-2xl">Add Achievement</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="space-y-2">
            <Label className="text-slate-200">Type</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setType("stripe")}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${
                    type === "stripe"
                      ? "border-purple-500 bg-purple-600/20"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  }
                `}
              >
                <span className="text-white font-semibold">Stripe</span>
              </button>
              <button
                onClick={() => setType("belt")}
                className={`
                  p-4 rounded-lg border-2 transition-all duration-200
                  ${
                    type === "belt"
                      ? "border-yellow-500 bg-yellow-600/20"
                      : "border-slate-700 bg-slate-800/30 hover:border-slate-600"
                  }
                `}
              >
                <span className="text-white font-semibold">Belt Promotion</span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title" className="text-slate-200">
              Title
            </Label>
            <Input
              id="title"
              placeholder={type === "belt" ? "e.g., Promoted to Blue Belt" : "e.g., First Stripe on White Belt"}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date" className="text-slate-200">
              Date Achieved
            </Label>
            <Input
              id="date"
              type="date"
              value={achievedDate}
              onChange={(e) => setAchievedDate(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="text-slate-200">
              Description (Optional)
            </Label>
            <Textarea
              id="description"
              placeholder="Add any additional notes about this achievement..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500"
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            onClick={onClose}
            variant="outline"
            disabled={isLoading}
            className="border-slate-700 bg-slate-800/50 text-white hover:bg-slate-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSave}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 transition-all duration-200"
          >
            {isLoading ? "Adding..." : "Add Achievement"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
