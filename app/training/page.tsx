import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Activity, ArrowRight, Dumbbell, HeartPulse, RotateCcw, Timer } from 'lucide-react'
import { getCurrentUser } from '@/lib/api/auth'
import { trainingCategories } from '@/lib/training/catalog/types'
import { categoryDescriptions, categoryLabels } from '@/lib/training/workouts'
import { TrainingShell } from '@/components/training/training-shell'

const icons = { mobility: RotateCcw, strength: Dumbbell, conditioning: Timer, solo: Activity, recovery: HeartPulse }

export default async function TrainingPage() {
  if (!await getCurrentUser()) redirect('/auth/login')

  return (
    <TrainingShell title="Training" description="Prepare for your next round, work on a specific skill, or log what you did today." back={false}>
      <nav aria-label="Training disciplines" className="divide-y divide-border">
        {trainingCategories.map(category => {
          const Icon = icons[category]
          return (
            <Link key={category} href={`/training/${category}`} className="group flex items-center gap-4 rounded-lg py-5 transition-colors hover:bg-muted/50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring sm:gap-6 sm:p-5">
              <span className="grid size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary"><Icon className="size-5" aria-hidden /></span>
              <span className="flex-1">
                <span className="block text-lg font-semibold">{categoryLabels[category]}</span>
                <span className="block text-sm text-muted-foreground">{categoryDescriptions[category]}</span>
              </span>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          )
        })}
        <Link href="/programmes" className="flex min-h-12 items-center justify-between gap-4 rounded-lg py-4 text-sm font-medium hover:bg-muted/50 sm:px-5">
          Strength programmes <ArrowRight className="size-4" aria-hidden />
        </Link>
      </nav>
    </TrainingShell>
  )
}
