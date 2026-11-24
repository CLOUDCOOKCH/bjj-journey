"use client"

import { useState, type ReactNode } from "react"
import { ArrowDown, ArrowUp, Settings2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { useQueryClient } from "@tanstack/react-query"
import { trainingClient, type TrainingRecord } from "@/lib/training/client"
import type { TrainingData } from "@/lib/training/schemas"
import { trainingQueryKey } from "@/lib/training/planner-client"

type Preferences = TrainingData<"preferences">
export type DashboardWidget = { id: string; label: string; content: ReactNode }

export function DashboardWidgets({ widgets, preferences }: { widgets: DashboardWidget[]; preferences?: TrainingRecord<Preferences> }) {
  const query = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [error, setError] = useState("")
  const [saving, setSaving] = useState(false)
  const [draft, setDraft] = useState<{ order: string[]; hidden: string[] }>()
  const ids = widgets.map(({ id }) => id)
  const order = [...new Set([...(preferences?.data.widgetOrder ?? []).filter((id) => ids.includes(id)), ...ids])]
  const hidden = preferences?.data.hiddenWidgets ?? []
  const byId = new Map(widgets.map((widget) => [widget.id, widget]))

  function move(index: number, direction: number) {
    if (!draft) return
    const next = [...draft.order]
    const other = index + direction
    if (other < 0 || other >= next.length) return
    [next[other], next[index]] = [next[index], next[other]]
    setDraft({ ...draft, order: next })
  }

  async function save() {
    if (!draft) return
    setSaving(true)
    setError("")
    try {
      const payload: Preferences = { key: "dashboard", widgetOrder: draft.order, hiddenWidgets: draft.hidden }
      if (preferences) await trainingClient.update("preferences", preferences.id, preferences.version, payload)
      else await trainingClient.create("preferences", payload)
      await query.invalidateQueries({ queryKey: trainingQueryKey("preferences") })
      setEditing(false)
    } catch (error) {
      setError(error instanceof Error ? error.message : "Dashboard preferences could not be saved.")
      await query.invalidateQueries({ queryKey: trainingQueryKey("preferences") })
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="space-y-4" aria-label="Dashboard overview">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-semibold">Training overview</h2>
        <Button size="sm" variant="outline" aria-expanded={editing} onClick={() => {
          setError("")
          setDraft({ order, hidden })
          setEditing(!editing)
        }}><Settings2 /> Customise</Button>
      </div>
      {editing && draft && (
        <div className="rounded-xl border bg-card p-4">
          <ul className="divide-y">
            {draft.order.map((id, index) => {
              const label = byId.get(id)?.label
              return <li key={id} className="flex min-h-11 flex-wrap items-center gap-2 px-2 py-1">
                <label className="flex min-w-32 flex-1 items-center gap-3 text-sm">
                  <Checkbox checked={!draft.hidden.includes(id)} onCheckedChange={(checked) => setDraft({
                    ...draft, hidden: checked ? draft.hidden.filter((item) => item !== id) : [...draft.hidden, id],
                  })} />
                  {label}
                </label>
                <Button size="icon-sm" variant="ghost" aria-label={`Move ${label} up`} disabled={index === 0} onClick={() => move(index, -1)}><ArrowUp /></Button>
                <Button size="icon-sm" variant="ghost" aria-label={`Move ${label} down`} disabled={index === draft.order.length - 1} onClick={() => move(index, 1)}><ArrowDown /></Button>
              </li>
            })}
          </ul>
          {error && <p className="my-2 text-sm text-destructive" role="alert">{error}</p>}
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={() => void save()} disabled={saving}>{saving ? "Saving…" : "Save dashboard"}</Button>
            <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
          </div>
        </div>
      )}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {order.filter((id) => !hidden.includes(id)).map((id) => (
          <div key={id} className="min-w-0">{byId.get(id)?.content}</div>
        ))}
      </div>
    </section>
  )
}
