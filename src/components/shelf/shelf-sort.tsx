'use client'

import { SortAscending, SortDescending } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type SortField = 'title' | 'author' | 'createdAt' | 'rating'
export type SortDirection = 'asc' | 'desc'

interface ShelfSortProps {
  sortField: SortField
  sortDirection: SortDirection
  onSortChange: (field: SortField, direction: SortDirection) => void
}

const SORT_OPTIONS: { value: SortField; label: string }[] = [
  { value: 'createdAt', label: 'Data de adição' },
  { value: 'title', label: 'Título' },
  { value: 'author', label: 'Autor' },
  { value: 'rating', label: 'Avaliação' },
]

export function ShelfSort({ sortField, sortDirection, onSortChange }: ShelfSortProps) {
  const handleFieldChange = (field: SortField) => {
    if (field === sortField) {
      // Toggle direction
      onSortChange(field, sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      // Default to descending for dates/rating, ascending for text
      const defaultDirection = field === 'createdAt' || field === 'rating' ? 'desc' : 'asc'
      onSortChange(field, defaultDirection)
    }
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-text-muted">Ordenar:</span>
      <div className="flex gap-1">
        {SORT_OPTIONS.map((option) => (
          <button
            key={option.value}
            onClick={() => handleFieldChange(option.value)}
            className={cn(
              'flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm transition-colors',
              sortField === option.value
                ? 'bg-green-deep text-cream'
                : 'bg-white text-text-dark hover:bg-cream-dark'
            )}
          >
            {option.label}
            {sortField === option.value && (
              sortDirection === 'asc' ? (
                <SortAscending className="h-4 w-4" />
              ) : (
                <SortDescending className="h-4 w-4" />
              )
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
