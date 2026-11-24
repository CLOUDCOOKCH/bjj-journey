import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth'
import { PerformanceShell } from '@/components/performance/performance-shell'
import { ProgressWorkspace } from '@/components/performance/progress-workspace'

export default async function ProgressPage() {
  const user = await getCurrentUser()
  if (!user?.id) redirect('/auth/login')
  return <PerformanceShell title="Progress"><ProgressWorkspace userId={user.id} /></PerformanceShell>
}
