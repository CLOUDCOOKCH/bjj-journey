import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'

export function TrainingShell({ title, description, children, back = true }: {
  title: string
  description: string
  children: React.ReactNode
  back?: boolean
}) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav />
      <MobileBottomNav />
      <main className="lg:ml-64">
        <div className="mx-auto max-w-6xl px-4 pb-24 pt-6 sm:px-8 sm:pt-10 lg:pb-12">
          {back && <Link href="/training" className="inline-flex min-h-11 items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft aria-hidden className="size-4" /> Training
          </Link>}
          <header className="mb-8 border-b border-border pb-6">
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">{title}</h1>
            <p className="mt-3 max-w-xl text-muted-foreground">{description}</p>
          </header>
          {children}
        </div>
      </main>
    </div>
  )
}
