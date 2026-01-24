"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Video, Users, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDateString } from "@/lib/utils/date"
import { useDeleteJournalEntry, journalEntryKeys } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Technique {
  id: string
  name: string
  youtubeUrl: string | null
}

interface RecentEntry {
  id: string
  entryDate: string
  notes: string | null
  techniques: Technique[]
}

interface RecentEntriesProps {
  entries: RecentEntry[]
}

export function RecentEntries({ entries }: RecentEntriesProps) {
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)

  const queryClient = useQueryClient()
  const deleteEntry = useDeleteJournalEntry({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: journalEntryKeys.lists() })
      setEntryToDelete(null)
    },
  })

  const handleDelete = async () => {
    if (entryToDelete) {
      await deleteEntry.mutateAsync(entryToDelete)
    }
  }

  // Determine entry type and icon based on content
  const getEntryType = (entry: RecentEntry) => {
    if (entry.techniques && entry.techniques.length > 0) {
      return {
        type: "Technique Review",
        icon: Video,
        iconColor: "text-primary",
        bgColor: "bg-slate-800/50",
      }
    }
    if (entry.notes?.toLowerCase().includes("open mat")) {
      return {
        type: "Open Mat",
        icon: Users,
        iconColor: "text-muted-foreground",
        bgColor: "bg-slate-800/50",
      }
    }
    return {
      type: "Training Session",
      icon: Calendar,
      iconColor: "text-primary",
      bgColor: "bg-slate-800/50",
    }
  }

  return (
    <>
      <section className="animate-in fade-in slide-in-from-right-8 duration-700 delay-200">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Recent Activity</h2>
          <Button
            asChild
            size="sm"
            variant="ghost"
            className="text-primary hover:text-primary/80 text-xs font-bold uppercase tracking-widest"
          >
            <Link href="/journal">View All History</Link>
          </Button>
        </div>

        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="bg-muted/50 p-4 rounded-full mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground/50" />
              </div>
              <p className="text-muted-foreground">No training sessions yet. Start logging your progress!</p>
            </div>
          ) : (
            entries.slice(0, 3).map((entry, index) => {
              const entryType = getEntryType(entry)
              const Icon = entryType.icon

              return (
                <Link key={entry.id} href={`/calendar?entry=${entry.id}`} className="block group">
                  <Card
                    className={`
                      p-5 rounded-2xl border-border/50 bg-card/40 backdrop-blur-md
                      hover:bg-card/60 transition-all duration-300
                      animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards
                      relative overflow-hidden
                    `}
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        {/* Icon container */}
                        <div className={`w-12 h-12 rounded-xl ${entryType.bgColor} flex items-center justify-center flex-shrink-0`}>
                          <Icon className={`text-xl ${entryType.iconColor}`} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-foreground text-base">{entryType.type}</h4>
                          <p className="text-xs text-muted-foreground font-medium mt-0.5 line-clamp-1">
                            {formatDateString(entry.entryDate, {
                              month: "short",
                              day: "numeric",
                            })}
                            {" • "}
                            {entry.notes || "No notes"}
                          </p>
                        </div>
                      </div>

                      {/* Right side - Type/Duration badge */}
                      <div className="hidden sm:flex flex-col items-end gap-1">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">Type</span>
                        <span className="text-sm font-semibold text-foreground">
                          {entryType.type === "Training Session" ? "Gi" : entryType.type === "Open Mat" ? "No-Gi" : "Theory"}
                        </span>
                      </div>

                      {/* Delete button */}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all sm:hidden"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setEntryToDelete(entry.id)
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="sr-only">Delete</span>
                      </Button>
                    </div>
                  </Card>
                </Link>
              )
            })
          )}
        </div>
      </section>

      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your training session.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-input hover:bg-accent hover:text-accent-foreground">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
