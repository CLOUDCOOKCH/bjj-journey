"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Calendar, Youtube, ChevronRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDateString } from "@/lib/utils/date"
import { useDeleteJournalEntry, journalEntryKeys } from "@/lib/hooks"
import { useQueryClient } from "@tanstack/react-query"
import ReactMarkdown from "react-markdown"
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

  return (
    <>
      <Card className="border-border/50 bg-card/40 backdrop-blur-md p-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-500 h-full">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-foreground">Recent Training Sessions</h3>
          <Button asChild size="sm" variant="outline" className="text-primary hover:text-primary hover:bg-primary/10 border-primary/20">
            <Link href="/calendar">View All</Link>
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
            entries.map((entry, index) => (
              <div
                key={entry.id}
                className="group p-4 bg-background/40 hover:bg-background/80 rounded-xl border border-border/50 hover:border-primary/30 transition-all duration-300 animate-in fade-in slide-in-from-bottom-4 fill-mode-backwards relative pr-12"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 text-primary">
                    <Calendar className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {formatDateString(entry.entryDate, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {entry.notes && (
                  <div className="text-sm text-muted-foreground mb-3 prose prose-invert prose-sm max-w-none line-clamp-2">
                    <ReactMarkdown>{entry.notes}</ReactMarkdown>
                  </div>
                )}

                {entry.techniques && entry.techniques.length > 0 && (
                  <div className="space-y-2 mt-3 pt-3 border-t border-border/50">
                    <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Techniques:</p>
                    <div className="flex flex-wrap gap-2">
                      {entry.techniques.map((technique) => (
                        <div key={technique.id} className="flex items-center gap-2 bg-accent/30 px-2 py-1 rounded-md">
                          {technique.youtubeUrl && <Youtube className="h-3 w-3 text-red-400" />}
                          <span className="text-xs text-foreground/80 font-medium">{technique.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Delete Button - Absolute positioned */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all scale-90 hover:scale-100"
                  onClick={(e) => {
                    e.preventDefault()
                    setEntryToDelete(entry.id)
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            ))
          )}
        </div>
      </Card>

      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => !open && setEntryToDelete(null)}>
        <AlertDialogContent className="bg-card border-border">
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Journal Entry?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your training session and any recorded techniques from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-input hover:bg-accent hover:text-accent-foreground">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
