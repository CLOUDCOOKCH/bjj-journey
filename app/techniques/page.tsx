'use client'

import { redirect } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SidebarNav } from '@/components/navigation/sidebar-nav'
import { MobileBottomNav } from '@/components/navigation/mobile-bottom-nav'
import { useReviewTechniques, useUpdateReviewTechnique } from '@/lib/hooks'
import { Button } from '@/components/ui/button'
import { Plus, Video as VideoIcon } from 'lucide-react'
import { useState } from 'react'
import { TechniqueFilters } from '@/components/review-techniques/technique-filters'
import { TechniqueCategories } from '@/components/review-techniques/technique-categories'
import { TechniqueReviewGrid } from '@/components/review-techniques/technique-review-grid'
import { TechniqueReviewDialog } from '@/components/review-techniques/technique-review-dialog'
import type { ReviewTechniquesFilters } from '@/lib/hooks'
import { useQueryClient } from '@tanstack/react-query'
import { reviewTechniqueKeys } from '@/lib/hooks/use-review-techniques'

export default function TechniquesPage() {
  const { data: session, status } = useSession()
  const isAuthenticated = status === 'authenticated'
  const queryClient = useQueryClient()

  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTechnique, setEditingTechnique] = useState<any>(null)
  const [filters, setFilters] = useState<ReviewTechniquesFilters>({
    category: undefined,
    trainingType: undefined,
    search: '',
    sort: 'recent',
  })

  const { data: techniques, isLoading, error } = useReviewTechniques(filters)

  const updateTechnique = useUpdateReviewTechnique({
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reviewTechniqueKeys.all })
    },
  })

  const handleToggleFavorite = (id: string) => {
    // Find the technique and toggle its favorite status
    const technique = techniques?.find((t) => t.id === id)
    if (technique) {
      updateTechnique.mutate({
        id,
        data: { isFavorite: !technique.isFavorite },
      })
    }
  }

  // Redirect if not authenticated
  if (!isAuthenticated && status !== 'loading') {
    redirect('/auth/login')
  }

  if (status === 'loading') {
    return null
  }

  const handleSearchChange = (search: string) => {
    setFilters((prev) => ({ ...prev, search: search || undefined }))
  }

  const handleCategoryChange = (category: string) => {
    setFilters((prev) => ({
      ...prev,
      category: category === 'all' ? undefined : category,
    }))
  }

  const handleTrainingTypeChange = (type: string) => {
    setFilters((prev) => ({
      ...prev,
      trainingType: type === 'all' ? undefined : type,
    }))
  }

  const handleEdit = (technique: any) => {
    setEditingTechnique(technique)
    setIsDialogOpen(true)
  }

  const handleAddNew = () => {
    setEditingTechnique(null)
    setIsDialogOpen(true)
  }

  return (
    <div className="flex min-h-screen bg-[#020617]">
      {/* Sidebar Navigation (Desktop) */}
      <aside className="hidden lg:block fixed left-0 top-0 h-screen w-64 border-r border-slate-800 bg-[#020617]">
        <SidebarNav />
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-64 pb-24 lg:pb-8">
        <div className="max-w-7xl mx-auto px-6 md:px-12 py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-tight">
                  Technique Review
                </h1>
                <p className="text-slate-400">
                  Build your personal library of techniques to review before training
                </p>
              </div>
              <Button
                onClick={handleAddNew}
                className="bg-teal-500 text-slate-950 hover:bg-teal-400 rounded-2xl font-semibold"
                size="lg"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Technique
              </Button>
            </div>
          </header>

          {/* Filters */}
          <div className="space-y-6 mb-8">
            <TechniqueFilters
              onSearchChange={handleSearchChange}
              onTrainingTypeChange={handleTrainingTypeChange}
              selectedTrainingType={filters.trainingType}
            />

            <TechniqueCategories
              selectedCategory={filters.category}
              onCategoryChange={handleCategoryChange}
            />
          </div>

          {/* Techniques Grid */}
          <TechniqueReviewGrid
            techniques={techniques}
            isLoading={isLoading}
            error={error}
            onToggleFavorite={handleToggleFavorite}
            onEdit={handleEdit}
          />
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <MobileBottomNav />

      {/* Floating Action Button (Mobile) */}
      <Button
        onClick={handleAddNew}
        className="lg:hidden fixed bottom-24 right-6 w-14 h-14 bg-teal-500 rounded-2xl shadow-lg shadow-teal-500/30 hover:scale-110 active:scale-90 transition-all z-40"
        size="icon"
      >
        <Plus className="text-slate-950 w-6 h-6" />
      </Button>

      {/* Add/Edit Dialog */}
      <TechniqueReviewDialog
        isOpen={isDialogOpen}
        onClose={() => {
          setIsDialogOpen(false)
          setEditingTechnique(null)
        }}
        technique={editingTechnique}
      />
    </div>
  )
}
