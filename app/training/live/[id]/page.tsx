import { notFound, redirect } from 'next/navigation'
import { z } from 'zod'
import { getCurrentUser } from '@/lib/api/auth'
import { LiveWorkout } from '@/components/training/live-workout'

export default async function LiveWorkoutPage({ params }: { params: Promise<{ id: string }> }) {
  const [user, { id }] = await Promise.all([getCurrentUser(), params])
  if (!user?.id) redirect('/auth/login')
  if (!z.string().uuid().safeParse(id).success) notFound()
  return <LiveWorkout id={id} userId={user.id} />
}
