"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { QuickEntryDialog } from "@/components/quick-entry-dialog"

interface QuickEntryButtonProps {
  userId: string
}

export function QuickEntryButton({ userId }: QuickEntryButtonProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-blue-600 hover:bg-blue-700 transition-all duration-200 shadow-lg hover:shadow-blue-500/20"
      >
        <Plus className="h-4 w-4 mr-2" />
        Quick Entry
      </Button>
      <QuickEntryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} userId={userId} />
    </>
  )
}
