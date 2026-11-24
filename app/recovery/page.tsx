import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/api/auth'
import { PerformanceShell } from '@/components/performance/performance-shell'
import { RecoveryWorkspace } from '@/components/performance/recovery-workspace'

export default async function RecoveryPage() {
  const user = await getCurrentUser()
  if (!user?.id) redirect('/auth/login')
  return <PerformanceShell title="Recovery"><RecoveryWorkspace userId={user.id} /></PerformanceShell>
}
