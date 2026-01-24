'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Trash2, Loader2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { useQueryClient } from '@tanstack/react-query'
import { useCreateReviewTechnique, useUpdateReviewTechnique, reviewTechniqueKeys } from '@/lib/hooks/use-review-techniques'
import type { ReviewTechniqueWithVideos } from '@/lib/hooks/use-review-techniques'
import { cn } from '@/lib/utils'

// Dynamic import of markdown editor to avoid SSR issues
const MDEditor = dynamic(
  () => import('@uiw/react-md-editor').then((mod) => mod.default),
  { ssr: false }
)

interface Video {
  youtubeUrl: string
  title?: string
}

interface TechniqueReviewDialogProps {
  isOpen: boolean
  onClose: () => void
  technique?: ReviewTechniqueWithVideos | null
}

export function TechniqueReviewDialog({
  isOpen,
  onClose,
  technique,
}: TechniqueReviewDialogProps) {
  const queryClient = useQueryClient()

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [notes, setNotes] = useState('')
  const [category, setCategory] = useState('')
  const [beltLevel, setBeltLevel] = useState('')
  const [difficulty, setDifficulty] = useState('')
  const [trainingType, setTrainingType] = useState('')
  const [videos, setVideos] = useState<Video[]>([{ youtubeUrl: '' }])

  const createTechnique = useCreateReviewTechnique({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
      resetForm()
      onClose()
    },
  })

  const updateTechnique = useUpdateReviewTechnique({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
      resetForm()
      onClose()
    },
  })

  useEffect(() => {
    if (technique) {
      setName(technique.name || '')
      setDescription(technique.description || '')
      setNotes(technique.notes || '')
      setCategory(technique.category || '')
      setBeltLevel(technique.beltLevel || '')
      setDifficulty(technique.difficulty || '')
      setTrainingType(technique.trainingType || '')
      setVideos(
        technique.videos?.length > 0
          ? technique.videos.map((v) => ({ youtubeUrl: v.youtubeUrl, title: v.title || '' }))
          : [{ youtubeUrl: '' }]
      )
    } else {
      resetForm()
    }
  }, [technique, isOpen])

  const resetForm = () => {
    setName('')
    setDescription('')
    setNotes('')
    setCategory('')
    setBeltLevel('')
    setDifficulty('')
    setTrainingType('')
    setVideos([{ youtubeUrl: '' }])
  }

  const addVideo = () => {
    setVideos([...videos, { youtubeUrl: '' }])
  }

  const removeVideo = (index: number) => {
    if (videos.length > 1) {
      setVideos(videos.filter((_, i) => i !== index))
    }
  }

  const updateVideo = (index: number, field: keyof Video, value: string) => {
    const newVideos = [...videos]
    newVideos[index] = { ...newVideos[index], [field]: value }
    setVideos(newVideos)
  }

  const handleSubmit = () => {
    // Basic validation
    if (!name.trim()) {
      return // Could add error handling here
    }

    const validVideos = videos.filter((v) => v.youtubeUrl.trim() !== '')

    const data = {
      name: name.trim(),
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      category: category || undefined,
      beltLevel: beltLevel || undefined,
      difficulty: difficulty || undefined,
      trainingType: trainingType || undefined,
      videos: validVideos.length > 0 ? validVideos : undefined,
    }

    if (technique) {
      updateTechnique.mutate({ id: technique.id, data })
    } else {
      createTechnique.mutate(data)
    }
  }

  const isPending = createTechnique.isPending || updateTechnique.isPending

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto glass-card">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {technique ? 'Edit Technique' : 'Add New Technique'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Name */}
          <div>
            <Label htmlFor="name" className="text-slate-300">
              Technique Name <span className="text-red-400">*</span>
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Butterfly Guard Sweep"
              className="bg-slate-900/50 border-slate-800 text-slate-100"
            />
          </div>

          {/* Description */}
          <div>
            <Label htmlFor="description" className="text-slate-300">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Brief description of the technique..."
              rows={2}
              className="bg-slate-900/50 border-slate-800 text-slate-100 resize-none"
            />
          </div>

          {/* Category & Training Type */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category" className="text-slate-300">Category</Label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Select category</option>
                <option value="guard">Guard</option>
                <option value="submissions">Submissions</option>
                <option value="sweeps">Sweeps</option>
                <option value="takedowns">Takedowns</option>
                <option value="transitions">Transitions</option>
                <option value="escapes">Escapes</option>
              </select>
            </div>

            <div>
              <Label htmlFor="trainingType" className="text-slate-300">Training Type</Label>
              <select
                id="trainingType"
                value={trainingType}
                onChange={(e) => setTrainingType(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Select type</option>
                <option value="gi">Gi</option>
                <option value="no-gi">No-Gi</option>
                <option value="both">Both</option>
              </select>
            </div>
          </div>

          {/* Belt Level & Difficulty */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="beltLevel" className="text-slate-300">Belt Level</Label>
              <select
                id="beltLevel"
                value={beltLevel}
                onChange={(e) => setBeltLevel(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Select level</option>
                <option value="white">White Belt</option>
                <option value="blue">Blue Belt</option>
                <option value="purple">Purple Belt</option>
                <option value="brown">Brown Belt</option>
                <option value="black">Black Belt</option>
              </select>
            </div>

            <div>
              <Label htmlFor="difficulty" className="text-slate-300">Difficulty</Label>
              <select
                id="difficulty"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="">Select difficulty</option>
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
                <option value="expert">Expert</option>
              </select>
            </div>
          </div>

          {/* Videos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-slate-300">YouTube Videos</Label>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={addVideo}
                className="text-teal-400 hover:text-teal-300 hover:bg-teal-500/10"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add Video
              </Button>
            </div>
            {videos.map((video, index) => (
              <div key={index} className="flex gap-2 mb-2">
                <Input
                  value={video.youtubeUrl}
                  onChange={(e) => updateVideo(index, 'youtubeUrl', e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 bg-slate-900/50 border-slate-800 text-slate-100"
                />
                <Input
                  value={video.title || ''}
                  onChange={(e) => updateVideo(index, 'title', e.target.value)}
                  placeholder="Video title (optional)"
                  className="w-1/3 bg-slate-900/50 border-slate-800 text-slate-100"
                />
                {videos.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeVideo(index)}
                    className="text-slate-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          {/* Notes (Markdown) */}
          <div>
            <Label htmlFor="notes" className="text-slate-300 mb-2 block">
              Notes (Markdown)
            </Label>
            <div className="data-md-editor">
              <MDEditor
                value={notes}
                onChange={(val) => setNotes(val || '')}
                height={200}
                preview="edit"
                textareaProps={{
                  placeholder: 'Add detailed notes about the technique...',
                  className: 'bg-slate-900/50 text-slate-100',
                }}
                className="!bg-slate-900/50"
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="bg-slate-900/50 border-slate-800 text-slate-300"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !name.trim()}
            className="bg-teal-500 text-slate-950 hover:bg-teal-400 min-w-[120px]"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : technique ? (
              'Update'
            ) : (
              'Create'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
