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
        className="transition-all duration-200 shadow-lg hover:shadow-primary/20 hover:scale-105 active:scale-95"
        size="lg"
      >
        <Plus className="h-5 w-5 mr-2" />
        Quick Entry
      </Button>
      <QuickEntryDialog isOpen={isOpen} onClose={() => setIsOpen(false)} userId={userId} />
    </>
  )
}
