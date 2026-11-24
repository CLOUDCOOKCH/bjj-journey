"use client"

import { useState, type FormEvent } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { activityCategories, activityLabels, isWorkoutCategory, type PlannedActivity } from "@/lib/training/planner"
import { routineCatalog } from "@/lib/training/catalog"
import type { TrainingData } from "@/lib/training/schemas"
import type { TrainingRecord } from "@/lib/training/client"

interface Props {
  initial: PlannedActivity
  scope: "create" | "occurrence" | "series" | "edit"
  templates: TrainingRecord<TrainingData<"templates">>[]
  saving: boolean
  onCancel: () => void
  onSave: (data: PlannedActivity) => void
}

const selectClass = "flex h-10 w-full rounded-md border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring"

export function CalendarActivityForm({ initial, scope, templates, saving, onCancel, onSave }: Props) {
  const [data, setData] = useState(initial)
  const [error, setError] = useState("")
  const candidates = routineCatalog.filter(({ category }) => category === data.category)
  const custom = templates.filter((template) => template.data.category === data.category)
  const update = (values: Partial<PlannedActivity>) => setData((current) => ({ ...current, ...values }))

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!data.title.trim()) return setError("Enter an activity name.")
    if (data.repeat?.until && data.repeat.until < data.date) return setError("Choose a recurrence end date on or after the first activity.")
    setError("")
    onSave({ ...data, title: data.title.trim(), notes: data.notes?.trim() || undefined })
  }

  return (
    <form onSubmit={submit} className="grid gap-4 border-b bg-card px-4 py-5 sm:px-6" aria-labelledby="activity-editor-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="activity-editor-title" className="text-lg font-semibold">{scope === "create" ? "Schedule an activity" : scope === "series" ? "Edit recurring series" : scope === "occurrence" ? "Edit this occurrence" : "Edit activity"}</h2>
        <p className="text-xs text-muted-foreground">{data.timeZone}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="space-y-1.5">
          <Label htmlFor="activity-category">Category</Label>
          <select id="activity-category" className={selectClass} value={data.category} onChange={(event) => {
            const category = event.currentTarget.value as PlannedActivity["category"]
            update({ category, title: !data.title || data.title === activityLabels[data.category] ? activityLabels[category] : data.title, templateSlug: undefined, workoutTemplateId: undefined, ...(category === "rest" ? { durationMinutes: 0 } : data.category === "rest" ? { durationMinutes: 30 } : {}) })
          }}>
            {activityCategories.map((category) => <option key={category} value={category}>{activityLabels[category]}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity-title">Name</Label>
          <Input id="activity-title" required maxLength={200} value={data.title} onChange={(event) => update({ title: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity-date">Date</Label>
          <Input id="activity-date" type="date" required value={data.date} onChange={(event) => update({ date: event.target.value })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity-time">Start time <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="activity-time" type="time" value={data.time ?? ""} onChange={(event) => update({ time: event.target.value || undefined, reminderMinutes: event.target.value ? data.reminderMinutes : undefined })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity-duration">Duration (minutes)</Label>
          <Input id="activity-duration" type="number" min={data.category === "rest" ? 0 : 1} max={1440} required value={Number.isNaN(data.durationMinutes) ? "" : data.durationMinutes} onChange={(event) => update({ durationMinutes: event.target.valueAsNumber })} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="activity-reminder">In-app reminder</Label>
          <select id="activity-reminder" className={selectClass} disabled={!data.time} value={data.reminderMinutes ?? ""} onChange={(event) => update({ reminderMinutes: event.target.value === "" ? undefined : Number(event.target.value) })}>
            <option value="">None</option>
            {[[5, "5 minutes before"], [15, "15 minutes before"], [30, "30 minutes before"], [60, "1 hour before"], [1440, "1 day before"]].map(([value, name]) => <option key={value} value={value}>{name}</option>)}
          </select>
        </div>
        {!data.seriesId && scope !== "occurrence" && (
          <>
            <div className="space-y-1.5">
              <Label htmlFor="activity-repeat">Repeats</Label>
              <select id="activity-repeat" className={selectClass} value={data.repeat?.intervalWeeks ?? 0} onChange={(event) => {
                const intervalWeeks = Number(event.target.value)
                update({ repeat: intervalWeeks ? { ...data.repeat, intervalWeeks } : undefined })
              }}>
                <option value={0}>Does not repeat</option>
                <option value={1}>Every week</option>
                <option value={2}>Every two weeks</option>
                <option value={4}>Every four weeks</option>
              </select>
            </div>
            {data.repeat && (
              <div className="space-y-1.5">
                <Label htmlFor="activity-repeat-until">Repeat through <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="activity-repeat-until" type="date" min={data.date} value={data.repeat.until ?? ""} onChange={(event) => update({ repeat: { ...data.repeat!, until: event.target.value || undefined } })} />
              </div>
            )}
          </>
        )}
        {isWorkoutCategory(data.category) && (
          <div className="space-y-1.5">
            <Label htmlFor="activity-template">Workout template</Label>
            <select id="activity-template" className={selectClass} value={data.workoutTemplateId ? `custom:${data.workoutTemplateId}` : data.templateSlug ?? ""} onChange={(event) => {
              const selected = event.target.value
              const preset = candidates.find((template) => template.slug === selected)
              const saved = custom.find((template) => `custom:${template.id}` === selected)
              update({
                templateSlug: preset?.slug,
                workoutTemplateId: saved?.id,
                ...(data.title === activityLabels[data.category] && (preset || saved) ? { title: preset?.name ?? saved?.data.title } : {}),
                ...(preset ? { durationMinutes: preset.durationMinutes } : {}),
              })
            }}>
              <option value="">Choose when starting</option>
              {data.templateSlug?.startsWith("programme:") && <option value={data.templateSlug}>Programme workout</option>}
              {candidates.map((template) => <option key={template.slug} value={template.slug}>{template.name}</option>)}
              {custom.map(({ id, data: template }) => <option key={id} value={`custom:${id}`}>{template.title}</option>)}
            </select>
          </div>
        )}
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="activity-notes">Notes <span className="font-normal text-muted-foreground">(optional)</span></Label>
        <Textarea id="activity-notes" maxLength={2000} value={data.notes ?? ""} onChange={(event) => update({ notes: event.target.value })} />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={saving}>{saving ? "Saving…" : "Save activity"}</Button>
        <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </form>
  )
}
