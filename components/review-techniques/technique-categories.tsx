'use client'

import { Button } from '@/components/ui/button'
import { Shield, Sword, Move, Zap, ArrowRightLeft, DoorOpen } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TechniqueCategoriesProps {
  selectedCategory?: string
  onCategoryChange: (category: string) => void
}

const CATEGORIES = [
  { id: 'guard', name: 'Guard', icon: Shield, emoji: '🛡️' },
  { id: 'submissions', name: 'Submissions', icon: Sword, emoji: '🔒' },
  { id: 'sweeps', name: 'Sweeps', icon: Move, emoji: '🌊' },
  { id: 'takedowns', name: 'Takedowns', icon: Zap, emoji: '⬇️' },
  { id: 'transitions', name: 'Transitions', icon: ArrowRightLeft, emoji: '↔️' },
  { id: 'escapes', name: 'Escapes', icon: DoorOpen, emoji: '🚪' },
] as const

export function TechniqueCategories({
  selectedCategory,
  onCategoryChange,
}: TechniqueCategoriesProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {CATEGORIES.map((category) => {
        const Icon = category.icon
        const isActive = selectedCategory === category.id

        return (
          <Button
            key={category.id}
            variant="ghost"
            onClick={() => onCategoryChange(isActive ? 'all' : category.id)}
            className={cn(
              'glass-card p-4 rounded-2xl flex flex-col items-center gap-2 group',
              'hover:bg-slate-900/50 h-auto transition-all duration-200',
              'border border-transparent',
              isActive
                ? 'border-teal-500/50 bg-teal-500/10 shadow-lg shadow-teal-500/10'
                : 'hover:border-slate-700'
            )}
          >
            <div
              className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center transition-all',
                isActive
                  ? 'bg-teal-500/20'
                  : 'bg-slate-800 group-hover:bg-slate-700'
              )}
            >
              <Icon
                className={cn(
                  'text-xl',
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-300'
                )}
              />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{category.emoji}</span>
              <span
                className={cn(
                  'text-xs font-bold transition-colors',
                  isActive ? 'text-teal-400' : 'text-slate-400 group-hover:text-slate-200'
                )}
              >
                {category.name}
              </span>
            </div>
          </Button>
        )
      })}
    </div>
  )
}
