import { AthletePage } from '@/components/athlete-page'
import { WeeklyReflections } from './weekly-reflections'

export default function WeeklyReflectionsPage() {
  return (
    <AthletePage title="Weekly reflection" description="Look back at your progress and decide what to take into the next week.">
      <WeeklyReflections />
    </AthletePage>
  )
}
