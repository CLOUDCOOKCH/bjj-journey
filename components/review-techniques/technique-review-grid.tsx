'use client'

import { TechniqueReviewCard } from './technique-review-card'
import type { ReviewTechniqueWithVideos, ReviewTechniquesFilters } from '@/lib/hooks/use-review-techniques'
import { Loader2, Video, Search } from 'lucide-react'

interface TechniqueReviewGridProps {
  filters?: ReviewTechniquesFilters
  techniques?: ReviewTechniqueWithVideos[]
  isLoading?: boolean
  error?: unknown
  onToggleFavorite?: (id: string) => void
  onEdit?: (technique: ReviewTechniqueWithVideos) => void
}

export function TechniqueReviewGrid({
  techniques,
  isLoading,
  error,
  onToggleFavorite,
  onEdit,
}: TechniqueReviewGridProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-400 mx-auto mb-4" />
          <p className="text-slate-400">Loading techniques...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center mx-auto mb-4">
            <span className="text-3xl">⚠️</span>
          </div>
          <p className="text-slate-400 mb-2">Failed to load techniques</p>
          <p className="text-sm text-slate-600">Please try again later</p>
        </div>
      </div>
    )
  }

  if (!techniques || techniques.length === 0) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="text-center max-w-md">
          <Video className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-100 mb-2">No techniques found</h3>
          <p className="text-slate-400 mb-6">
            {`You haven't added any techniques to your review library yet. Start building your collection!`}
          </p>
          <div className="text-sm text-slate-500">
            <Search className="w-4 h-4 inline mr-1" />
            Try adjusting your filters or add your first technique
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {techniques.map((technique) => (
          <TechniqueReviewCard
            key={technique.id}
            technique={technique}
            onToggleFavorite={onToggleFavorite}
            onEdit={onEdit}
          />
        ))}
      </div>
    </div>
  )
}
