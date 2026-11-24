import { AthletePage } from '@/components/athlete-page'
import { getCurrentUser } from '@/lib/api/auth'
import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { eq } from 'drizzle-orm'
import { profiles } from '@/lib/db/schema'
import { ProgrammeBuilder } from './programme-builder'

export default async function ProgrammesPage() {
  const user = await getCurrentUser()
  if (!user?.id) redirect('/auth/login')
  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
    columns: { belt: true },
  })

  return (
    <AthletePage title="Training programmes" description="Build your week around the time you spend on the mats.">
      <ProgrammeBuilder belt={profile?.belt ?? 'white'} userId={user.id} />
    </AthletePage>
  )
}
