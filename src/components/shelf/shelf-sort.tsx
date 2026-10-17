'use client'

import { SortAscending, SortDescending } from '@phosphor-icons/react'

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
    // datas e notas: maior primeiro; texto: A→Z
    const defaultDirection = field === 'createdAt' || field === 'rating' ? 'desc' : 'asc'
    onSortChange(field, defaultDirection)
  }

  const directionLabel = sortDirection === 'asc' ? 'Ordem crescente' : 'Ordem decrescente'

  return (
    <div className="flex items-center gap-1">
      <label htmlFor="shelf-sort" className="sr-only">
        Ordenar por
      </label>
      <select
        id="shelf-sort"
        value={sortField}
        onChange={(e) => handleFieldChange(e.target.value as SortField)}
        className="border-line bg-surface text-text-dark focus:border-green-deep focus:ring-green-deep/20 h-10 rounded-lg border pr-8 pl-3 text-sm focus:ring-2 focus:outline-none"
      >
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <button
        type="button"
        onClick={() => onSortChange(sortField, sortDirection === 'asc' ? 'desc' : 'asc')}
        className="border-line bg-surface text-text-muted hover:text-text-dark flex h-10 w-10 items-center justify-center rounded-lg border transition-colors"
        title={directionLabel}
        aria-label={directionLabel}
      >
        {sortDirection === 'asc' ? (
          <SortAscending className="h-5 w-5" />
        ) : (
          <SortDescending className="h-5 w-5" />
        )}
      </button>
    </div>
  )
}
