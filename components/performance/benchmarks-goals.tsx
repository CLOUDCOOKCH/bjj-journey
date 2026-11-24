'use client'

import { useState, type FormEvent } from 'react'
import { ChartSpline, Plus, Target } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import type { TrainingRecord } from '@/lib/training/client'
import {
  benchmarkCategories, benchmarkResultSchema, benchmarkSchema, benchmarkUnits, builtInBenchmarks,
  goalMetrics, goalSchema, startOfTrainingWeek, weeklyGoalProgress, type Benchmark, type BenchmarkResult,
  type RecoveryCheckIn, type TrainingGoal, type TrainingSample,
} from '@/lib/training/performance'
import { formatDateString } from '@/lib/utils/date'
import { fieldClass, FormError, LoadError } from './performance-shell'
import { usePerformanceRecords } from './training-records'
import { MetricTrend } from './metric-trend'

const emptyBenchmark: Benchmark = { title: '', category: 'custom', unit: 'reps', lowerIsBetter: false }
const numericFormat = new Intl.NumberFormat('en', { maximumFractionDigits: 2 })

function benchmarkUnit(benchmark: Benchmark): string {
  return benchmark.customUnit && benchmark.unit === 'custom' ? benchmark.customUnit : benchmark.unit
}

function BenchmarkForm({ initial, save, cancel, pending }: {
  initial?: Benchmark
  save: (benchmark: Benchmark) => Promise<unknown>
  cancel: () => void
  pending: boolean
}) {
  const [draft, setDraft] = useState<Benchmark>(initial ?? emptyBenchmark)
  const [error, setError] = useState('')
  const change = <Key extends keyof Benchmark>(field: Key, value: Benchmark[Key]) => setDraft((current) => ({ ...current, [field]: value }))

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = benchmarkSchema.safeParse(draft)
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Benchmark saved')
      cancel()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the benchmark.')
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-border p-4" onSubmit={submit}>
      <label className="block space-y-1 text-sm font-medium">
        <span>Benchmark name</span>
        <input className={fieldClass} required maxLength={100} value={draft.title} onChange={(event) => change('title', event.target.value)} />
      </label>
      <div className="grid gap-3 sm:grid-cols-3">
        <label className="space-y-1 text-sm font-medium">
          <span>Category</span>
          <select className={fieldClass} value={draft.category} onChange={(event) => change('category', event.target.value as Benchmark['category'])}>
            {benchmarkCategories.map((category) => <option key={category} value={category}>{category}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Unit</span>
          <select className={fieldClass} value={draft.unit} onChange={(event) => change('unit', event.target.value as Benchmark['unit'])}>
            {benchmarkUnits.map((unit) => <option key={unit} value={unit}>{unit}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium">
          <span>Better results are</span>
          <select className={fieldClass} value={draft.lowerIsBetter ? 'lower' : 'higher'} onChange={(event) => change('lowerIsBetter', event.target.value === 'lower')}>
            <option value="higher">Higher</option><option value="lower">Lower</option>
          </select>
        </label>
      </div>
      {draft.unit === 'custom' && (
        <label className="block space-y-1 text-sm font-medium">
          <span>Custom unit</span>
          <input className={fieldClass} required maxLength={32} value={draft.customUnit ?? ''} onChange={(event) => change('customUnit', event.target.value)} />
        </label>
      )}
      <label className="block space-y-1 text-sm font-medium">
        <span>Test protocol (optional)</span>
        <textarea className={`${fieldClass} min-h-20 py-2`} maxLength={1000} value={draft.protocol ?? ''} onChange={(event) => change('protocol', event.target.value)} />
      </label>
      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save benchmark'}</Button>
        <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
      </div>
    </form>
  )
}

function ResultForm({ benchmarkId, unit, today, pending, save, close }: {
  benchmarkId: string
  unit: string
  today: string
  pending: boolean
  save: (result: BenchmarkResult) => Promise<unknown>
  close: () => void
}) {
  const [date, setDate] = useState(today)
  const [value, setValue] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = benchmarkResultSchema.safeParse({ benchmarkId, date, value: value === '' ? undefined : Number(value), notes: notes || undefined })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Benchmark result recorded')
      close()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the result.')
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-border p-3" onSubmit={submit}>
      <div className="grid grid-cols-2 gap-3">
        <label className="space-y-1 text-sm font-medium"><span>Date</span><input className={fieldClass} type="date" max={today} value={date} onChange={(event) => setDate(event.target.value)} required /></label>
        <label className="space-y-1 text-sm font-medium"><span>Result ({unit})</span><input className={fieldClass} type="number" inputMode="decimal" min="0" max="1000000" step={unit === 'reps' ? '1' : 'any'} value={value} onChange={(event) => setValue(event.target.value)} required /></label>
      </div>
      <label className="block space-y-1 text-sm font-medium"><span>Notes (optional)</span><input className={fieldClass} maxLength={1000} value={notes} onChange={(event) => setNotes(event.target.value)} /></label>
      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save result'}</Button>
        <Button type="button" variant="outline" onClick={close}>Cancel</Button>
      </div>
    </form>
  )
}

function BenchmarkHistory({ benchmark, results }: { benchmark: Benchmark; results: TrainingRecord<BenchmarkResult>[] }) {
  if (results.length === 0) return <p className="text-sm text-muted-foreground">No results recorded yet.</p>
  const ordered = results.slice().sort((left, right) => left.data.date.localeCompare(right.data.date) || left.createdAt.localeCompare(right.createdAt))
  const numbers = ordered.map(({ data }) => data.value)
  const min = Math.min(...numbers)
  const max = Math.max(...numbers)
  const best = benchmark.lowerIsBetter ? min : max
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">Personal best · {numericFormat.format(best)} {benchmarkUnit(benchmark)}</p>
      <MetricTrend label={benchmark.title + " results over time"} values={numbers} />
      <details>
        <summary className="cursor-pointer rounded-sm py-2 text-sm focus-visible:outline-2 focus-visible:outline-ring">Result history ({results.length})</summary>
        <ul className="divide-y divide-border">
          {ordered.reverse().map(({ id, data }) => (
            <li key={id} className="grid grid-cols-[1fr_auto] py-2 text-sm">
              <span>{formatDateString(data.date)}</span>
              <span>{numericFormat.format(data.value)} {benchmarkUnit(benchmark)}</span>
              {data.notes && <p className="col-span-2 mt-1 text-muted-foreground">{data.notes}</p>}
            </li>
          ))}
        </ul>
      </details>
    </div>
  )
}

export function BenchmarksPanel({ userId, today }: { userId: string; today: string }) {
  const benchmarks = usePerformanceRecords('benchmarks', userId)
  const results = usePerformanceRecords('benchmark-results', userId)
  const [form, setForm] = useState<Benchmark | null>(null)
  const [resultFor, setResultFor] = useState<string | null>(null)

  return (
    <Card id="benchmarks" className="scroll-mt-24">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2"><ChartSpline className="size-5 text-primary" /> Benchmarks</CardTitle>
          <CardDescription>Repeat a consistent test and follow your own results over time.</CardDescription>
        </div>
        {benchmarks.query.isSuccess && <Button type="button" variant="outline" onClick={() => setForm(emptyBenchmark)}><Plus /> Create benchmark</Button>}
      </CardHeader>
      <CardContent className="space-y-4">
        {benchmarks.query.isError || results.query.isError ? <LoadError onRetry={() => { void benchmarks.query.refetch(); void results.query.refetch() }}>Could not load benchmarks.</LoadError> : (
          benchmarks.query.isPending || results.query.isPending ? <p role="status">Loading benchmarks…</p> : (
            <>
              <details className="rounded-xl border border-border p-3">
                <summary className="cursor-pointer rounded-sm py-1 text-sm font-medium focus-visible:outline-2 focus-visible:outline-ring">Use a built-in benchmark</summary>
                <ul className="mt-1 divide-y divide-border">
                  {builtInBenchmarks.map((template) => (
                    <li key={template.title} className="flex flex-wrap items-center justify-between gap-2 py-2">
                      <span className="text-sm">{template.title}</span>
                      <Button type="button" variant="outline" size="sm" onClick={() => setForm(template)}>Use <span className="sr-only">{template.title}</span></Button>
                    </li>
                  ))}
                </ul>
              </details>
              {form && (
                <BenchmarkForm key={form.title || 'custom'} initial={form} pending={benchmarks.save.isPending} cancel={() => setForm(null)} save={(data) => benchmarks.save.mutateAsync({ data })} />
              )}
              {benchmarks.query.data?.length === 0 && !form && <p className="text-sm text-muted-foreground">Choose a benchmark or create a test you can repeat.</p>}
              <div className="grid gap-3 lg:grid-cols-2">
                {benchmarks.query.data?.map(({ id, data }) => (
                  <section key={id} className="space-y-3 rounded-xl border border-border p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <h3 className="font-semibold">{data.title}</h3>
                      <Button type="button" variant="outline" size="sm" onClick={() => setResultFor(id)}>Add result <span className="sr-only">for {data.title}</span></Button>
                    </div>
                    {data.protocol && <p className="text-sm text-muted-foreground">{data.protocol}</p>}
                    <BenchmarkHistory benchmark={data} results={(results.query.data ?? []).filter((record) => record.data.benchmarkId === id)} />
                    {resultFor === id && <ResultForm benchmarkId={id} unit={benchmarkUnit(data)} today={today} pending={results.save.isPending} close={() => setResultFor(null)} save={(result) => results.save.mutateAsync({ data: result })} />}
                  </section>
                ))}
              </div>
            </>
          )
        )}
      </CardContent>
    </Card>
  )
}

function GoalForm({ initial, benchmarks, save, cancel, pending }: {
  initial?: TrainingGoal
  benchmarks: TrainingRecord<Benchmark>[]
  save: (goal: TrainingGoal) => Promise<unknown>
  cancel: () => void
  pending: boolean
}) {
  const [metric, setMetric] = useState<TrainingGoal['metric']>(initial?.metric ?? 'bjj_sessions')
  const [target, setTarget] = useState(initial ? String(initial.target) : '')
  const [benchmarkId, setBenchmarkId] = useState(initial?.benchmarkId ?? '')
  const [name, setName] = useState(initial?.name ?? '')
  const [error, setError] = useState('')

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const parsed = goalSchema.safeParse({
      metric, target: Number(target), benchmarkId: metric === 'benchmark' ? benchmarkId || undefined : undefined, name: name || undefined,
    })
    if (!parsed.success) {
      setError(parsed.error.issues[0].message)
      return
    }
    setError('')
    try {
      await save(parsed.data)
      toast.success('Goal saved')
      cancel()
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not save the goal.')
    }
  }

  return (
    <form className="space-y-3 rounded-xl border border-border p-3" onSubmit={submit}>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-sm font-medium">
          <span>Goal metric</span>
          <select className={fieldClass} value={metric} onChange={(event) => setMetric(event.target.value as TrainingGoal['metric'])}>
            {Object.entries(goalMetrics).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label className="space-y-1 text-sm font-medium"><span>Target</span><input className={fieldClass} type="number" inputMode="decimal" min={metric === 'benchmark' ? 0.01 : 1} step={metric === 'benchmark' ? 'any' : '1'} max="1000000" value={target} required onChange={(event) => setTarget(event.target.value)} /></label>
      </div>
      {metric === 'benchmark' && (
        <label className="block space-y-1 text-sm font-medium">
          <span>Benchmark</span>
          <select className={fieldClass} value={benchmarkId} required onChange={(event) => setBenchmarkId(event.target.value)}>
            <option value="">Choose a benchmark</option>
            {benchmarks.map(({ id, data }) => <option value={id} key={id}>{data.title} ({benchmarkUnit(data)})</option>)}
          </select>
          {benchmarks.length === 0 && <span className="block text-muted-foreground">Create a benchmark before setting its target.</span>}
        </label>
      )}
      <label className="block space-y-1 text-sm font-medium"><span>Goal name (optional)</span><input className={fieldClass} maxLength={100} value={name} onChange={(event) => setName(event.target.value)} /></label>
      <FormError message={error} />
      <div className="flex gap-2">
        <Button type="submit" disabled={pending}>{pending ? 'Saving…' : 'Save goal'}</Button>
        <Button type="button" variant="outline" onClick={cancel}>Cancel</Button>
      </div>
    </form>
  )
}

export function GoalsPanel({ userId, samples, checkIns, today }: {
  userId: string
  samples: TrainingSample[]
  checkIns: RecoveryCheckIn[]
  today: string
}) {
  const goals = usePerformanceRecords('goals', userId)
  const benchmarks = usePerformanceRecords('benchmarks', userId).query
  const results = usePerformanceRecords('benchmark-results', userId).query
  const [editor, setEditor] = useState<'new' | TrainingRecord<TrainingGoal> | null>(null)
  const [removing, setRemoving] = useState<string | null>(null)
  const [error, setError] = useState('')
  const weekStart = startOfTrainingWeek(today)
  const queries = [goals.query, benchmarks, results]

  async function removeGoal(record: TrainingRecord<TrainingGoal>) {
    setError('')
    try {
      await goals.remove.mutateAsync(record)
      setRemoving(null)
      toast.success('Goal removed')
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Could not remove the goal.')
    }
  }

  return (
    <Card id="goals" className="scroll-mt-24">
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <CardTitle className="flex items-center gap-2"><Target className="size-5 text-primary" /> Training goals</CardTitle>
          <CardDescription>Activity targets reset each Monday. Benchmark goals follow your personal best.</CardDescription>
        </div>
        {goals.query.isSuccess && <Button type="button" variant="outline" onClick={() => setEditor('new')}><Plus /> Add goal</Button>}
      </CardHeader>
      <CardContent className="space-y-4">
        {queries.some((query) => query.isError) ? <LoadError onRetry={() => queries.forEach((query) => { void query.refetch() })}>Could not load goals.</LoadError> : (
          queries.some((query) => query.isPending) ? <p role="status">Loading goals…</p> : (
            <>
              {editor && <GoalForm key={editor === 'new' ? 'new' : editor.id} initial={editor === 'new' ? undefined : editor.data} benchmarks={benchmarks.data ?? []} pending={goals.save.isPending} cancel={() => setEditor(null)} save={(data) => goals.save.mutateAsync({ data, previous: editor === 'new' ? undefined : editor })} />}
              {goals.query.data?.length === 0 && !editor && <p className="text-sm text-muted-foreground">Choose a weekly training target or a benchmark result to work towards.</p>}
              <FormError message={error} />
              <ul className="divide-y divide-border">
                {goals.query.data?.map((record) => {
                  const { id, data } = record
                  const benchmark = benchmarks.data?.find((item) => item.id === data.benchmarkId)?.data
                  const progress = weeklyGoalProgress(data, samples, checkIns, weekStart, today, benchmark, results.data?.map((result) => result.data))
                  const name = data.name ?? benchmark?.title ?? goalMetrics[data.metric]
                  return (
                    <li key={id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                      <div className="space-y-1">
                        <p className="font-medium">{name}</p>
                        <p className="text-sm text-muted-foreground">
                          {progress.value === null ? 'No result yet' : numericFormat.format(progress.value)} / {numericFormat.format(data.target)}{benchmark ? ` ${benchmarkUnit(benchmark)}` : ''}{progress.reached ? ' · Goal reached' : ''}
                        </p>
                        {data.metric !== 'benchmark' && <progress className="h-2 w-full accent-primary" value={Math.min(progress.value ?? 0, data.target)} max={data.target} aria-label={`${name} progress`} />}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {removing === id ? (
                          <>
                            <Button variant="destructive" type="button" size="sm" disabled={goals.remove.isPending} onClick={() => void removeGoal(record)}>Confirm removal</Button>
                            <Button variant="outline" type="button" size="sm" onClick={() => setRemoving(null)}>Cancel</Button>
                          </>
                        ) : (
                          <>
                            <Button variant="ghost" type="button" size="sm" onClick={() => setEditor(record)}>Edit <span className="sr-only">{name}</span></Button>
                            <Button variant="ghost" type="button" size="sm" onClick={() => setRemoving(id)}>Remove <span className="sr-only">{name}</span></Button>
                          </>
                        )}
                      </div>
                    </li>
                  )
                })}
              </ul>
            </>
          )
        )}
      </CardContent>
    </Card>
  )
}
