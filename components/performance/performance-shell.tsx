import type { ReactNode } from 'react'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { PageHeader } from '@/components/page-header'
import { Button } from '@/components/ui/button'

export function PerformanceShell({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-24 lg:pb-10">
        <PageHeader title={title} />
        <div className="mx-auto max-w-6xl space-y-6 px-4 py-6 lg:px-8">{children}</div>
      </main>
    </div>
  )
}

export const fieldClass = 'min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm shadow-xs focus-visible:outline-2 focus-visible:outline-ring'

export function LoadError({ onRetry, children }: { onRetry: () => void; children: ReactNode }) {
  return (
    <div role="alert" className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/40 bg-card p-4">
      <p>{children}</p>
      <Button type="button" variant="outline" onClick={onRetry}>Retry</Button>
    </div>
  )
}

export function FormError({ message }: { message?: string | null }) {
  return message ? <p role="alert" className="text-sm font-medium text-destructive">{message}</p> : null
}
