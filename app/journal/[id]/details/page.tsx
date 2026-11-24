import Link from 'next/link'
import { AthletePage } from '@/components/athlete-page'
import { Button } from '@/components/ui/button'
import { JournalDetailsForm } from './form'

export default async function TrainingDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return (
    <AthletePage title="Session reflection" description="Record what worked and what you want to practise next."
      actions={<Button variant="outline" asChild><Link href="/journal">Back to journal</Link></Button>}>
      <JournalDetailsForm id={id} />
    </AthletePage>
  )
}
