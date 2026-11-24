'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search } from 'lucide-react'
import { useState, useEffect } from 'react'
import { cn } from '@/lib/utils'

interface TechniqueFiltersProps {
  onSearchChange: (search: string) => void
  onTrainingTypeChange: (type: string) => void
  selectedTrainingType?: string
}

export function TechniqueFilters({
  onSearchChange,
  onTrainingTypeChange,
  selectedTrainingType = 'all',
}: TechniqueFiltersProps) {
  const [searchValue, setSearchValue] = useState('')
  useEffect(() => {
    const timeout = setTimeout(() => onSearchChange(searchValue), 300)
    return () => clearTimeout(timeout)
  }, [onSearchChange, searchValue])

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* Search Input */}
      <div className="relative flex-1">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5 pointer-events-none" />
        <Input
          type="text"
          placeholder="Search techniques... (e.g. Armbar, Guard Sweep)"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="w-full bg-slate-900/50 border-slate-800 rounded-2xl py-3.5 pl-12 pr-4 text-sm font-medium focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500/40 transition-all text-slate-100 placeholder:text-slate-600"
        />
      </div>

      {/* Filter Buttons */}
      <div className="flex gap-2">
        <Button
          variant={selectedTrainingType === 'all' ? 'default' : 'outline'}
          onClick={() => onTrainingTypeChange('all')}
          className={cn(
            'rounded-2xl transition-all',
            selectedTrainingType === 'all'
              ? 'bg-teal-500 text-slate-950 hover:bg-teal-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
          )}
        >
          All
        </Button>
        <Button
          variant={selectedTrainingType === 'gi' ? 'default' : 'outline'}
          onClick={() => onTrainingTypeChange('gi')}
          className={cn(
            'rounded-2xl transition-all',
            selectedTrainingType === 'gi'
              ? 'bg-teal-500 text-slate-950 hover:bg-teal-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
          )}
        >
          Gi
        </Button>
        <Button
          variant={selectedTrainingType === 'no-gi' ? 'default' : 'outline'}
          onClick={() => onTrainingTypeChange('no-gi')}
          className={cn(
            'rounded-2xl transition-all',
            selectedTrainingType === 'no-gi'
              ? 'bg-teal-500 text-slate-950 hover:bg-teal-400'
              : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:text-slate-100 hover:border-slate-700'
          )}
        >
          No-Gi
        </Button>
      </div>
    </div>
  )
}
