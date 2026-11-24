"use client"

import { useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { ArrowRight, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useDeleteJournalEntry, journalEntryKeys } from "@/lib/hooks/use-journal-entries"
import { formatCalendarDate, journalSessionLabel } from "@/lib/training/planner"
import { trainingQueryKey } from "@/lib/training/planner-client"
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface RecentEntry {
  id: string
  entryDate: string
  title: string | null
  sessionType: string
  durationMinutes: number | null
}

export function RecentEntries({ entries }: { entries: RecentEntry[] }) {
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const query = useQueryClient()
  const deleteEntry = useDeleteJournalEntry()
  async function remove() {
    if (!entryToDelete) return
    try {
      await deleteEntry.mutateAsync(entryToDelete)
      setEntryToDelete(null)
      await Promise.all([
        query.invalidateQueries({ queryKey: journalEntryKeys.all }),
        query.invalidateQueries({ queryKey: trainingQueryKey("activities") }),
      ])
    } catch {
      // The mutation retains its error so the confirmation can offer a retry.
    }
  }

  return (
    <section className="min-w-0 rounded-xl border bg-card p-4" aria-label="Recent mat sessions">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h2 className="text-base font-semibold">Recent mat sessions</h2>
        <Link href="/journal" className="inline-flex min-h-9 items-center gap-1 rounded text-xs font-medium text-primary hover:underline focus-visible:outline-2 focus-visible:outline-ring">
          Journal <ArrowRight className="size-3" />
        </Link>
      </div>
      {entries.length === 0
        ? <p className="text-sm text-muted-foreground">Your logged mat sessions appear here.</p>
        : <ul className="divide-y">{entries.slice(0, 3).map((entry) => <li key={entry.id} className="flex min-w-0 items-center gap-2">
          <Link href={`/journal/${entry.id}/details`} className="min-w-0 flex-1 rounded py-2 hover:text-primary focus-visible:outline-2 focus-visible:outline-ring">
            <span className="block truncate text-sm font-medium">{entry.title || journalSessionLabel(entry.sessionType)}</span>
            <span className="block text-xs text-muted-foreground">
              {formatCalendarDate(entry.entryDate, { month: "short", day: "numeric" })}
              {entry.title && ` · ${journalSessionLabel(entry.sessionType)}`}
              {entry.durationMinutes && ` · ${entry.durationMinutes} min`}
            </span>
          </Link>
          <Button variant="ghost" size="icon" aria-label={`Delete ${entry.title || journalSessionLabel(entry.sessionType)}`} onClick={() => {
            deleteEntry.reset()
            setEntryToDelete(entry.id)
          }}><Trash2 /></Button>
        </li>)}</ul>}
      <AlertDialog open={!!entryToDelete} onOpenChange={(open) => { if (!open && !deleteEntry.isPending) setEntryToDelete(null) }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this journal entry?</AlertDialogTitle>
            <AlertDialogDescription>The logged session and its notes will be removed from your training history.</AlertDialogDescription>
          </AlertDialogHeader>
          {deleteEntry.isError && <p role="alert" className="text-sm text-destructive">The entry could not be deleted. Try again.</p>}
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteEntry.isPending}>Keep entry</AlertDialogCancel>
            <Button variant="destructive" disabled={deleteEntry.isPending} onClick={() => void remove()}>{deleteEntry.isPending ? "Deleting…" : "Delete entry"}</Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
