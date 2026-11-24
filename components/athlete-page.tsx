import type { ReactNode } from 'react'
import { redirect } from 'next/navigation'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { PageHeader } from '@/components/page-header'
import { getCurrentUser } from '@/lib/api/auth'

export async function AthletePage({ title, description, actions, children }: {
  title: string
  description?: string
  actions?: ReactNode
  children: ReactNode
}) {
  const user = await getCurrentUser()
  if (!user) redirect('/auth/login')

  return (
    <div className="min-h-screen bg-background">
      <SidebarNav name={user.name ?? undefined} />
      <MobileBottomNav />
      <main className="pb-24 lg:ml-64 lg:pb-10">
        <PageHeader title={title} subtitle={description} actions={actions} />
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </div>
      </main>
    </div>
  )
}
