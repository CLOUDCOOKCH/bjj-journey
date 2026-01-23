"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Youtube } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { formatDateString } from "@/lib/utils/date"

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
  return (
    <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm p-6 animate-in fade-in slide-in-from-right-8 duration-700 delay-500">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-white">Recent Training Sessions</h3>
        <Button asChild size="sm" className="bg-blue-600 hover:bg-blue-700">
          <Link href="/calendar">View All</Link>
        </Button>
      </div>

      <div className="space-y-4">
        {entries.length === 0 ? (
          <p className="text-slate-400 text-center py-8">No training sessions yet. Start logging your progress!</p>
        ) : (
          entries.map((entry) => (
            <div
              key={entry.id}
              className="p-4 bg-slate-800/30 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-colors"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 text-slate-300">
                  <Calendar className="h-4 w-4 text-blue-400" />
                  <span className="text-sm font-medium">
                    {formatDateString(entry.entryDate, {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </div>

              {entry.notes && <p className="text-sm text-slate-400 mb-3 line-clamp-2">{entry.notes}</p>}

              {entry.techniques && entry.techniques.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 font-semibold uppercase">Techniques:</p>
                  {entry.techniques.map((technique) => (
                    <div key={technique.id} className="flex items-center gap-2">
                      {technique.youtubeUrl && <Youtube className="h-3 w-3 text-red-400" />}
                      <span className="text-sm text-slate-300">{technique.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
