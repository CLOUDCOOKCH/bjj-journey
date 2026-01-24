'use client'

import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Play, Star, Eye, Clock, Video, Edit, MoreVertical } from 'lucide-react'
import type { ReviewTechniqueWithVideos } from '@/lib/hooks/use-review-techniques'
import { useState } from 'react'
import { TechniqueVideoPlayer } from './technique-video-player'
import { cn } from '@/lib/utils'

interface TechniqueReviewCardProps {
  technique: ReviewTechniqueWithVideos
  variant?: 'full' | 'compact'
  onToggleFavorite?: (id: string) => void
  onEdit?: (technique: ReviewTechniqueWithVideos) => void
}

const DIFFICULTY_CONFIG = {
  beginner: { label: 'Beginner', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
  intermediate: { label: 'Intermediate', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  advanced: { label: 'Advanced', className: 'bg-teal-500/20 text-teal-400 border-teal-500/30' },
  expert: { label: 'Expert', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

const BELT_CONFIG = {
  white: { label: 'White Belt', className: 'bg-slate-500/20 text-slate-400 border-slate-500/30' },
  blue: { label: 'Blue Belt', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  purple: { label: 'Purple Belt', className: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  brown: { label: 'Brown Belt', className: 'bg-amber-700/20 text-amber-600 border-amber-700/30' },
  black: { label: 'Black Belt', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
} as const

const CATEGORY_CONFIG = {
  guard: { label: 'Guard', icon: '🛡️' },
  submissions: { label: 'Submission', icon: '🔒' },
  sweeps: { label: 'Sweep', icon: '🌊' },
  takedowns: { label: 'Takedown', icon: '⬇️' },
  transitions: { label: 'Transition', icon: '↔️' },
  escapes: { label: 'Escape', icon: '🚪' },
} as const

export function TechniqueReviewCard({
  technique,
  variant = 'full',
  onToggleFavorite,
  onEdit,
}: TechniqueReviewCardProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const hasVideo = technique.videos && technique.videos.length > 0
  const firstVideo = hasVideo ? technique.videos[0] : null

  const handleToggleFavorite = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.(technique.id)
  }

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation()
    onEdit?.(technique)
  }

  if (variant === 'compact') {
    return (
      <>
        <Card
          className={cn(
            'glass-card cursor-pointer transition-all duration-300',
            'hover:border-teal-500/30 hover:shadow-lg hover:shadow-teal-500/10'
          )}
          onClick={() => hasVideo && setIsPlaying(true)}
        >
          <div className="p-4">
            <div className="flex items-center gap-4">
              {hasVideo && firstVideo?.thumbnailUrl ? (
                <div className="relative w-24 h-16 rounded-lg overflow-hidden flex-shrink-0 bg-slate-800">
                  <img
                    src={firstVideo.thumbnailUrl}
                    alt={technique.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Play className="w-6 h-6 text-white" />
                  </div>
                </div>
              ) : (
                <div className="w-24 h-16 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-slate-600" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-sm text-slate-100 truncate">{technique.name}</h4>
                  {technique.isFavorite && (
                    <Star className="w-4 h-4 text-teal-400 fill-current flex-shrink-0" />
                  )}
                </div>
                <div className="flex items-center gap-3 text-xs text-slate-500">
                  {technique.category && (
                    <span className="font-medium uppercase tracking-wide">
                      {CATEGORY_CONFIG[technique.category as keyof typeof CATEGORY_CONFIG]?.label || technique.category}
                    </span>
                  )}
                  {technique.viewCount > 0 && (
                    <span className="flex items-center gap-1">
                      <Eye className="w-3 h-3" />
                      {technique.viewCount}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleEdit}
                  className="flex-shrink-0 p-2 text-slate-500 hover:text-teal-400 transition-colors"
                  title="Edit technique"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={handleToggleFavorite}
                  className="flex-shrink-0 p-2 text-slate-500 hover:text-teal-400 transition-colors"
                  title={technique.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Star className={cn('w-4 h-4', technique.isFavorite && 'fill-current text-teal-400')} />
                </button>
              </div>
            </div>
          </div>
        </Card>

        {isPlaying && hasVideo && (
          <TechniqueVideoPlayer
            videos={technique.videos}
            onClose={() => setIsPlaying(false)}
            open={isPlaying}
          />
        )}
      </>
    )
  }

  return (
    <>
      <Card
        className={cn(
          'glass-card rounded-2xl overflow-hidden flex flex-col group cursor-pointer',
          'transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-teal-500/10'
        )}
        onClick={() => hasVideo && setIsPlaying(true)}
      >
        {/* Video Thumbnail Section */}
        <div className="relative aspect-video bg-slate-800 overflow-hidden">
          {hasVideo && firstVideo?.thumbnailUrl ? (
            <>
              <img
                src={firstVideo.thumbnailUrl}
                alt={technique.name}
                className="w-full h-full object-cover opacity-70 group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/50 to-transparent" />

              {/* Difficulty & Training Type Badges */}
              <div className="absolute bottom-3 left-4 flex items-center gap-2">
                {technique.difficulty && (
                  <span
                    className={cn(
                      'text-[10px] font-bold px-2 py-1 rounded uppercase border',
                      DIFFICULTY_CONFIG[technique.difficulty]?.className
                    )}
                  >
                    {DIFFICULTY_CONFIG[technique.difficulty]?.label}
                  </span>
                )}
                {technique.trainingType && (
                  <span className="text-[10px] font-bold px-2 py-1 bg-slate-900/80 text-slate-200 rounded uppercase border border-slate-700">
                    {technique.trainingType === 'both' ? 'Gi & No-Gi' : technique.trainingType}
                  </span>
                )}
              </div>

              {/* Play Button Overlay */}
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="w-16 h-16 rounded-full bg-teal-500 flex items-center justify-center shadow-xl shadow-teal-500/40 transform scale-90 group-hover:scale-100 transition-transform">
                  <Play className="text-slate-950 text-2xl ml-1" />
                </div>
              </div>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-slate-800">
              <div className="text-center">
                <Video className="w-12 h-12 text-slate-600 mx-auto mb-2" />
                <span className="text-xs text-slate-600">No video content</span>
              </div>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="p-5 space-y-3 flex-1 flex flex-col">
          <div className="flex justify-between items-start gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-lg text-slate-100 group-hover:text-teal-400 transition-colors line-clamp-1">
                {technique.name}
              </h3>
              {technique.beltLevel && (
                <span
                  className={cn(
                    'text-[10px] font-bold px-2 py-0.5 rounded uppercase border mt-1 inline-block',
                    BELT_CONFIG[technique.beltLevel]?.className
                  )}
                >
                  {BELT_CONFIG[technique.beltLevel]?.label}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleEdit}
                className="flex-shrink-0 p-2 text-slate-500 hover:text-teal-400 transition-colors"
                title="Edit technique"
              >
                <Edit className="w-5 h-5" />
              </button>
              <button
                onClick={handleToggleFavorite}
                className="flex-shrink-0 p-2 text-slate-500 hover:text-teal-400 transition-colors"
                title={technique.isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              >
                <Star className={cn('w-5 h-5', technique.isFavorite && 'fill-current text-teal-400')} />
              </button>
            </div>
          </div>

          {technique.description && (
            <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed">
              {technique.description}
            </p>
          )}

          {/* Tags */}
          {technique.category && (
            <div className="flex flex-wrap gap-2 pt-2">
              <Badge variant="outline" className="text-xs font-medium text-slate-500 border-slate-700">
                {CATEGORY_CONFIG[technique.category as keyof typeof CATEGORY_CONFIG]?.icon} {' '}
                {CATEGORY_CONFIG[technique.category as keyof typeof CATEGORY_CONFIG]?.label}
              </Badge>
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 pt-2 text-xs text-slate-500 flex-wrap">
            {technique.viewCount > 0 && (
              <span className="flex items-center gap-1.5">
                <Eye className="w-3.5 h-3.5" />
                {technique.viewCount} {technique.viewCount === 1 ? 'view' : 'views'}
              </span>
            )}
            {technique.lastReviewed && (
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Reviewed {new Date(technique.lastReviewed).toLocaleDateString()}
              </span>
            )}
            {hasVideo && technique.videos.length > 1 && (
              <span className="flex items-center gap-1.5">
                <Video className="w-3.5 h-3.5" />
                {technique.videos.length} videos
              </span>
            )}
          </div>
        </div>
      </Card>

      {isPlaying && hasVideo && (
        <TechniqueVideoPlayer
          videos={technique.videos}
          onClose={() => setIsPlaying(false)}
          open={isPlaying}
        />
      )}
    </>
  )
}
