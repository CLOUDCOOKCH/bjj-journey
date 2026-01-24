'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState, useEffect } from 'react'

interface Video {
  id: string
  youtubeUrl: string
  title: string | null
  thumbnailUrl: string | null
  orderIndex: number
}

interface TechniqueVideoPlayerProps {
  videos: Video[]
  onClose: () => void
  open: boolean
}

export function TechniqueVideoPlayer({ videos, onClose, open }: TechniqueVideoPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Reset to first video when player opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(0)
    }
  }, [open])

  if (videos.length === 0) {
    return null
  }

  const currentVideo = videos[currentIndex]
  const videoId = extractYouTubeId(currentVideo.youtubeUrl)

  const goToPrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : videos.length - 1))
  }

  const goToNext = () => {
    setCurrentIndex((prev) => (prev < videos.length - 1 ? prev + 1 : 0))
  }

  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious()
      if (e.key === 'ArrowRight') goToNext()
      if (e.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, videos.length])

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl w-full p-0 max-h-[85vh] overflow-y-auto glass-card flex flex-col"
        showCloseButton={false}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border/50 shrink-0 sticky top-0 bg-inherit z-10 backdrop-blur-md">
          <h3 className="text-lg font-semibold text-slate-100 truncate flex-1 min-w-0 pr-4">
            {currentVideo.title || `Video ${currentIndex + 1}`}
          </h3>
          <div className="flex items-center gap-2 shrink-0">
            {videos.length > 1 && (
              <>
                <Button variant="ghost" size="icon" onClick={goToPrevious} className="text-slate-400 hover:text-slate-100">
                  <ChevronLeft className="w-5 h-5" />
                </Button>
                <span className="text-sm text-slate-500 min-w-[3rem] text-center hidden sm:inline-block">
                  {currentIndex + 1} / {videos.length}
                </span>
                <Button variant="ghost" size="icon" onClick={goToNext} className="text-slate-400 hover:text-slate-100">
                  <ChevronRight className="w-5 h-5" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onClose} className="text-slate-400 hover:text-slate-100">
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Video Embed */}
        <div className="aspect-video bg-black shrink-0">
          <iframe
            key={`${videoId}-${currentIndex}`}
            width="100%"
            height="100%"
            src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
            title={currentVideo.title || 'Technique Video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="border-0"
          />
        </div>

        {/* Video List (only show if multiple videos) */}
        {videos.length > 1 && (
          <div className="p-4 border-t border-border/50 bg-slate-950/50 grow">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {videos.map((video, index) => (
                <button
                  type="button"
                  key={video.id}
                  onClick={() => setCurrentIndex(index)}
                  className={`flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border-2 transition-all hover:scale-105 ${index === currentIndex
                      ? 'border-teal-500 shadow-lg shadow-teal-500/20'
                      : 'border-transparent hover:border-slate-600'
                    }`}
                >
                  {video.thumbnailUrl ? (
                    <img
                      src={video.thumbnailUrl}
                      alt={video.title || `Video ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <span className="text-xs text-slate-600">Video {index + 1}</span>
                    </div>
                  )}
                  {index === currentIndex && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full bg-teal-500/90 flex items-center justify-center">
                        <span className="text-xs font-bold text-slate-950">▶</span>
                      </div>
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

function extractYouTubeId(url: string): string {
  // Handle various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /youtube\.com\/shorts\/([^&\n?#]+)/,
  ]

  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) return match[1]
  }

  // If no pattern matches, return empty string (will show error in iframe)
  return ''
}
