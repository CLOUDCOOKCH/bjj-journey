'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { Heart, Plus, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { getCatalogExercise } from '@/lib/training/catalog'
import { bodyRegions, type CatalogExercise, type TrainingCategory } from '@/lib/training/catalog/types'

export interface LibraryExercise extends Omit<CatalogExercise, 'illustration' | 'source' | 'bodyRegions'> {
  illustration?: CatalogExercise['illustration']
  source?: CatalogExercise['source']
  bodyRegions: string[]
}

export type ExerciseInput = Omit<LibraryExercise, 'slug' | 'source' | 'illustration' | 'targetMuscles' | 'substitutions'>
export const fieldSelect = 'min-h-11 w-full min-w-0 rounded-md border border-input bg-background px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring'
export const regionLabel = (region: string) => region.charAt(0).toUpperCase() + region.slice(1).replaceAll('-', ' ')

function splitLines(value: FormDataEntryValue | null) {
  return String(value ?? '').split('\n').map(line => line.trim()).filter(Boolean)
}

export function CustomExerciseForm({ category, close, save }: {
  category: TrainingCategory
  close: () => void
  save: (exercise: ExerciseInput) => Promise<void>
}) {
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const data = new FormData(event.currentTarget)
    const instructions = splitLines(data.get('instructions'))
    const name = String(data.get('name')).trim()
    const description = String(data.get('description')).trim()
    if (!name || !description || !instructions.length || !data.get('bodyRegion')) {
      setError('Enter a name, description, at least one instruction, and a body region.')
      return
    }
    setBusy(true)
    setError('')
    try {
      await save({
        category, name, description, instructions,
        bodyRegions: [String(data.get('bodyRegion'))],
        equipment: String(data.get('equipment') ?? '').split(',').map(item => item.trim()).filter(Boolean),
        dosage: String(data.get('dosage') ?? '').trim(),
        difficulty: data.get('difficulty') as ExerciseInput['difficulty'],
        safety: splitLines(data.get('safety')),
        movementPattern: String(data.get('movementPattern') ?? '').trim(),
        bjjRelevance: String(data.get('bjjRelevance') ?? '').trim(),
        commonMistakes: [],
        variations: { easier: '', harder: '' },
      })
      close()
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Could not save your exercise.')
    } finally { setBusy(false) }
  }

  return (
    <form onSubmit={submit} className="space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
      <h3 className="text-lg font-semibold">Add a private exercise</h3>
      <div className="grid gap-4 sm:grid-cols-2">
        <Label className="grid gap-2">Name<Input name="name" className="min-h-11" maxLength={120} required /></Label>
        <Label className="grid gap-2">Equipment <span className="text-xs text-muted-foreground">Separate items with commas.</span><Input name="equipment" maxLength={250} /></Label>
        <Label className="grid gap-2">Primary region
          <select name="bodyRegion" className={fieldSelect} required defaultValue="">
            <option value="" disabled>Select one</option>
            {bodyRegions.map(region => <option key={region} value={region}>{regionLabel(region)}</option>)}
          </select>
        </Label>
        <Label className="grid gap-2">Difficulty
          <select name="difficulty" className={fieldSelect}><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option></select>
        </Label>
        <Label className="grid gap-2 sm:col-span-2">Description<Textarea name="description" maxLength={500} required /></Label>
        <Label className="grid gap-2 sm:col-span-2">Instructions <span className="text-xs text-muted-foreground">Write one instruction per line.</span><Textarea name="instructions" maxLength={2000} required /></Label>
        <Label className="grid gap-2">Recommended repetitions or time<Input name="dosage" maxLength={120} /></Label>
        <Label className="grid gap-2">Movement pattern<Input name="movementPattern" maxLength={100} /></Label>
        <Label className="grid gap-2">Safety notes<Textarea name="safety" maxLength={1000} /></Label>
        <Label className="grid gap-2">BJJ relevance<Textarea name="bjjRelevance" maxLength={500} /></Label>
      </div>
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
      <div className="flex flex-wrap gap-2">
        <Button type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save exercise'}</Button>
        <Button type="button" variant="outline" onClick={close}>Cancel</Button>
      </div>
    </form>
  )
}

export function ExerciseLibrary({ exercises, onAdd, favourites, onFavourite, category, saveCustom }: {
  exercises: LibraryExercise[]
  onAdd: (exercise: LibraryExercise) => void
  favourites: ReadonlySet<string>
  onFavourite: (slug: string) => void
  category: TrainingCategory
  saveCustom: (exercise: ExerciseInput) => Promise<void>
}) {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [equipment, setEquipment] = useState('')
  const [regions, setRegions] = useState<string[]>([])
  const [favouritesOnly, setFavouritesOnly] = useState(false)
  const [custom, setCustom] = useState(false)
  const [show, setShow] = useState(12)
  const enabledRegions = useMemo(() => Array.from(new Set(exercises.flatMap(exercise => exercise.bodyRegions))), [exercises])
  const equipmentOptions = useMemo(() => Array.from(new Set(exercises.flatMap(exercise => exercise.equipment))).sort(), [exercises])
  const matches = exercises.filter(exercise => {
    const query = search.trim().toLowerCase()
    return (!query || [exercise.name, exercise.description, exercise.movementPattern].some(text => text.toLowerCase().includes(query))) &&
      (!difficulty || exercise.difficulty === difficulty) &&
      (!equipment || (equipment === 'none' ? !exercise.equipment.length : exercise.equipment.includes(equipment))) &&
      (!regions.length || exercise.bodyRegions.some(region => regions.includes(region))) &&
      (!favouritesOnly || favourites.has(exercise.slug))
  })
  function toggleRegion(region: string) {
    setRegions(current => current.includes(region) ? current.filter(item => item !== region) : [...current, region])
    setShow(12)
  }

  return (
    <section aria-labelledby="exercise-library" className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="exercise-library" className="text-2xl font-semibold tracking-tight">Exercise library</h2>
        <Button variant="outline" className="min-h-11" onClick={() => setCustom(value => !value)} aria-expanded={custom}><Plus aria-hidden /> Custom exercise</Button>
      </div>
      {custom && <CustomExerciseForm category={category} close={() => setCustom(false)} save={saveCustom} />}
      <div className="grid gap-3 sm:grid-cols-3">
        <Label className="grid gap-2">
          Search exercises
          <span className="relative block"><Search aria-hidden className="absolute left-3 top-3.5 size-4 text-muted-foreground" /><Input type="search" className="min-h-11 pl-9" value={search} onChange={event => { setSearch(event.target.value); setShow(12) }} /></span>
        </Label>
        <Label className="grid gap-2">Difficulty
          <select className={fieldSelect} value={difficulty} onChange={event => { setDifficulty(event.target.value); setShow(12) }}>
            <option value="">Any difficulty</option><option value="beginner">Beginner</option><option value="intermediate">Intermediate</option><option value="advanced">Advanced</option>
          </select>
        </Label>
        <Label className="grid gap-2">Equipment
          <select className={fieldSelect} value={equipment} onChange={event => { setEquipment(event.target.value); setShow(12) }}>
            <option value="">Any equipment</option><option value="none">No equipment</option>
            {equipmentOptions.filter(item => item !== 'none').map(item => <option key={item}>{item}</option>)}
          </select>
        </Label>
      </div>
      {category === 'mobility' && <BodyRegionPicker enabled={enabledRegions} selected={regions} toggle={toggleRegion} />}
      <div className="flex items-center justify-between gap-3">
        <p role="status" className="text-sm text-muted-foreground">{matches.length} {matches.length === 1 ? 'exercise' : 'exercises'}</p>
        <Button variant={favouritesOnly ? 'secondary' : 'ghost'} size="sm" className="min-h-11" aria-pressed={favouritesOnly} onClick={() => { setFavouritesOnly(value => !value); setShow(12) }}><Heart aria-hidden /> Favourites</Button>
      </div>
      {!matches.length && <p className="rounded-xl border border-border p-5 text-sm text-muted-foreground">No exercises match these filters. Clear a filter or change your search.</p>}
      {matches.length > 0 && <div className="divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
        {matches.slice(0, show).map(exercise => (
          <div key={exercise.slug} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-1 px-3 sm:gap-x-3 sm:px-5">
            <details className="min-w-0">
              <summary className="min-h-14 cursor-pointer py-4 pr-1 font-medium leading-snug hover:text-primary">
                {exercise.name} <span className="ml-2 text-xs font-normal capitalize text-muted-foreground">{exercise.difficulty}</span>
              </summary>
              <div className="grid gap-4 pb-5 pr-2 sm:grid-cols-[minmax(0,1fr)_9rem]">
                <div className="space-y-3 text-sm leading-relaxed">
                  <p>{exercise.description}</p>
                  <ol className="ml-5 list-decimal space-y-1">{exercise.instructions.map((step, index) => <li key={index}>{step}</li>)}</ol>
                  <dl className="space-y-1.5 text-muted-foreground">
                    <div><dt className="inline font-medium text-foreground">Regions </dt><dd className="inline">{exercise.bodyRegions.map(regionLabel).join(', ')}</dd></div>
                    <div><dt className="inline font-medium text-foreground">Equipment </dt><dd className="inline">{exercise.equipment.join(', ') || 'None'}</dd></div>
                    {!!exercise.targetMuscles?.length && <div><dt className="inline font-medium text-foreground">Target muscles </dt><dd className="inline">{exercise.targetMuscles.join(', ')}</dd></div>}
                    {!!exercise.substitutions?.length && <div><dt className="inline font-medium text-foreground">Substitutions </dt><dd className="inline">{exercise.substitutions.map(slug => getCatalogExercise(slug)?.name ?? regionLabel(slug)).join(', ')}</dd></div>}
                    {exercise.movementPattern && <div><dt className="inline font-medium text-foreground">Pattern </dt><dd className="inline">{exercise.movementPattern}</dd></div>}
                    {exercise.dosage && <div><dt className="inline font-medium text-foreground">Suggested dose </dt><dd className="inline">{exercise.dosage}</dd></div>}
                    {exercise.bjjRelevance && <div><dt className="inline font-medium text-foreground">On the mat </dt><dd className="inline">{exercise.bjjRelevance}</dd></div>}
                    {!!exercise.commonMistakes.length && <div><dt className="inline font-medium text-foreground">Common mistakes </dt><dd className="inline">{exercise.commonMistakes.join(' ')}</dd></div>}
                    {!!exercise.safety.length && <div><dt className="inline font-medium text-foreground">Safety </dt><dd className="inline">{exercise.safety.join(' ')}</dd></div>}
                    {exercise.variations.easier && <div><dt className="inline font-medium text-foreground">Easier </dt><dd className="inline">{exercise.variations.easier}</dd></div>}
                    {exercise.variations.harder && <div><dt className="inline font-medium text-foreground">Harder </dt><dd className="inline">{exercise.variations.harder}</dd></div>}
                  </dl>
                  {exercise.videoUrl && <a className="font-medium text-primary underline underline-offset-4" href={exercise.videoUrl} target="_blank" rel="noreferrer">Watch exercise video</a>}
                  {exercise.source && <p className="text-xs text-muted-foreground">{exercise.source.name} · {exercise.source.license}</p>}
                </div>
                {exercise.illustration && <Image src={exercise.illustration.src} alt={exercise.illustration.alt} width={144} height={144} className="w-full max-w-40 rounded-lg bg-muted/60" />}
              </div>
            </details>
            <div className="flex gap-0.5 pt-1.5">
              <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={`${favourites.has(exercise.slug) ? 'Unfavourite' : 'Favourite'} ${exercise.name}`} aria-pressed={favourites.has(exercise.slug)} onClick={() => onFavourite(exercise.slug)}><Heart aria-hidden className={favourites.has(exercise.slug) ? 'fill-current text-primary' : ''} /></Button>
              <Button type="button" variant="ghost" size="icon" className="size-11" aria-label={`Add ${exercise.name} to workout`} onClick={() => onAdd(exercise)}><Plus aria-hidden /></Button>
            </div>
          </div>
        ))}
      </div>}
      {matches.length > show && <Button variant="outline" className="min-h-11" onClick={() => setShow(count => count + 12)}>Show more exercises</Button>}
    </section>
  )
}

const mapPoints = {
  Front: [
    ['neck', 50, 16], ['shoulders', 28, 24], ['wrists', 16, 50], ['hip-flexors', 61, 49],
    ['adductors', 37, 58], ['knees', 64, 70], ['ankles', 67, 86],
  ],
  Back: [
    ['neck', 50, 16], ['shoulders', 72, 24], ['thoracic-spine', 50, 33], ['wrists', 84, 50],
    ['glutes', 61, 49], ['hamstrings', 37, 58], ['hips', 39, 46], ['ankles', 33, 86],
  ],
} as const

function BodyRegionPicker({ enabled, selected, toggle }: {
  enabled: string[]
  selected: string[]
  toggle: (region: string) => void
}) {
  return (
    <fieldset className="flex flex-col gap-4 rounded-xl border border-border px-4 pb-4 sm:flex-row sm:items-center">
      <legend className="px-2 font-medium">Body regions</legend>
      <div className="flex justify-center gap-3">
        {Object.entries(mapPoints).map(([side, points]) => (
          <figure key={side} className="w-28 shrink-0 rounded-lg bg-muted/50 px-1 pt-2 text-center">
            <div className="relative mx-auto h-44 max-w-24">
              <Image src={`/training/body-${side.toLowerCase()}.svg`} alt={`${side} view of the body`} fill className="object-contain" />
              {points.filter(([region]) => enabled.includes(region)).map(([region, x, y]) => (
                <button type="button" key={region} aria-label={`${side} view, ${regionLabel(region)}`} aria-pressed={selected.includes(region)} onClick={() => toggle(region)} className="absolute grid size-6 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border border-primary bg-background/85 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring aria-pressed:bg-primary aria-pressed:text-primary-foreground" style={{ left: `${x}%`, top: `${y}%` }}>
                  <span aria-hidden className="size-1.5 rounded-full bg-current" />
                </button>
              ))}
            </div>
            <figcaption className="pb-2 text-xs text-muted-foreground">{side}</figcaption>
          </figure>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        {enabled.map(region => <Button size="sm" variant={selected.includes(region) ? 'secondary' : 'outline'} className="min-h-11" key={region} aria-pressed={selected.includes(region)} onClick={() => toggle(region)}>{regionLabel(region)}</Button>)}
      </div>
    </fieldset>
  )
}
