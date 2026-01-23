"use client"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { SidebarNav } from "@/components/navigation/sidebar-nav"
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav"

interface PageSkeletonProps {
  belt?: string
  showStats?: boolean
  showList?: boolean
  showChart?: boolean
  statsCount?: number
  listCount?: number
}

export function PageSkeleton({ 
  belt,
  showStats = true,
  showList = true,
  showChart = false,
  statsCount = 3,
  listCount = 5,
}: PageSkeletonProps) {
  return (
    <div className="min-h-screen bg-background">
      <SidebarNav belt={belt} />
      <MobileBottomNav />
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          {showStats && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {Array.from({ length: statsCount }).map((_, i) => (
                <Card key={i} className="p-6 rounded-3xl border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton variant="circle" className="h-12 w-12" />
                    <Skeleton variant="text" className="h-6 w-20" />
                  </div>
                  <Skeleton variant="title" className="mb-2" />
                  <Skeleton variant="text" />
                </Card>
              ))}
            </div>
          )}

          {showChart && (
            <Card className="p-6 rounded-3xl border-border/50 mb-8">
              <Skeleton variant="title" className="mb-4" />
              <div className="space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton variant="text" className="h-6 w-16" />
                    <Skeleton variant="card" className="h-8 flex-1 rounded-lg" />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {showList && (
            <div className="space-y-4">
              {Array.from({ length: listCount }).map((_, i) => (
                <Card key={i} className="p-6 rounded-3xl border-border/50">
                  <div className="flex items-start justify-between mb-4">
                    <Skeleton variant="circle" className="h-10 w-10" />
                    <div className="flex-1 ml-4">
                      <Skeleton variant="title" className="mb-2" />
                      <Skeleton variant="text" />
                      <Skeleton variant="text" className="w-1/2" />
                    </div>
                    <Skeleton variant="button" className="h-8 w-24" />
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export function DashboardSkeleton({ belt }: { belt?: string }) {
  return (
    <PageSkeleton 
      belt={belt}
      showStats={true}
      showChart={true}
      showList={false}
      statsCount={3}
    />
  )
}

export function JournalSkeleton({ belt }: { belt?: string }) {
  return (
    <PageSkeleton 
      belt={belt}
      showStats={false}
      showChart={false}
      showList={true}
      listCount={5}
    />
  )
}

export function CalendarSkeleton({ belt }: { belt?: string }) {
  return (
    <PageSkeleton 
      belt={belt}
      showStats={false}
      showChart={true}
      showList={true}
      listCount={3}
    />
  )
}
