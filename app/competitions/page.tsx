import { AthletePage } from '@/components/athlete-page'
import { CompetitionPlanner } from './competition-planner'

export default function CompetitionsPage() {
  return (
    <AthletePage title="Competitions" description="Plan your preparation and reflect on what you learned at each event.">
      <CompetitionPlanner />
    </AthletePage>
  )
}
