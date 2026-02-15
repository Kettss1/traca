'use client'

import { useState } from 'react'
import { Funnel, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'READ' | 'ABANDONED'

interface ShelfFiltersProps {
  authors: string[]
  publishers: string[]
  categories: string[]
  tags: string[]
  selectedStatus: ReadingStatus | null
  selectedAuthor: string | null
  selectedPublisher: string | null
  selectedCategory: string | null
  selectedTag: string | null
  onStatusChange: (status: ReadingStatus | null) => void
  onAuthorChange: (author: string | null) => void
  onPublisherChange: (publisher: string | null) => void
  onCategoryChange: (category: string | null) => void
  onTagChange: (tag: string | null) => void
  onClearAll: () => void
}

const STATUS_LABELS: Record<ReadingStatus, string> = {
  WANT_TO_READ: 'Quero Ler',
  READING: 'Lendo',
  READ: 'Lido',
  ABANDONED: 'Abandonado',
}

export function ShelfFilters({
  authors,
  publishers,
  categories,
  tags,
  selectedStatus,
  selectedAuthor,
  selectedPublisher,
  selectedCategory,
  selectedTag,
  onStatusChange,
  onAuthorChange,
  onPublisherChange,
  onCategoryChange,
  onTagChange,
  onClearAll,
}: ShelfFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  const hasActiveFilters =
    selectedStatus || selectedAuthor || selectedPublisher || selectedCategory || selectedTag

  const activeFilterCount = [
    selectedStatus,
    selectedAuthor,
    selectedPublisher,
    selectedCategory,
    selectedTag,
  ].filter(Boolean).length

  return (
    <div className="space-y-3">
      {/* Filter toggle button */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
            isExpanded || hasActiveFilters
              ? 'bg-green-deep text-cream'
              : 'bg-white text-text-dark hover:bg-cream-dark'
          )}
        >
          <Funnel className="h-4 w-4" />
          Filtros
          {activeFilterCount > 0 && (
            <span className="rounded-full bg-cream/20 px-2 py-0.5 text-xs">
              {activeFilterCount}
            </span>
          )}
        </button>

        {hasActiveFilters && (
          <button
            onClick={onClearAll}
            className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-text-muted hover:bg-cream-dark hover:text-text-dark"
          >
            <X className="h-4 w-4" />
            Limpar filtros
          </button>
        )}
      </div>

      {/* Expanded filters */}
      {isExpanded && (
        <div className="grid gap-4 rounded-lg bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3">
          {/* Status filter */}
          <div>
            <label className="mb-2 block text-xs font-medium text-text-muted">Status</label>
            <select
              value={selectedStatus || ''}
              onChange={(e) => onStatusChange((e.target.value as ReadingStatus) || null)}
              className="w-full rounded-lg border border-brown/20 bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
            >
              <option value="">Todos</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          {/* Author filter */}
          {authors.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-text-muted">Autor</label>
              <select
                value={selectedAuthor || ''}
                onChange={(e) => onAuthorChange(e.target.value || null)}
                className="w-full rounded-lg border border-brown/20 bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
              >
                <option value="">Todos</option>
                {authors.map((author) => (
                  <option key={author} value={author}>
                    {author}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Publisher filter */}
          {publishers.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-text-muted">Editora</label>
              <select
                value={selectedPublisher || ''}
                onChange={(e) => onPublisherChange(e.target.value || null)}
                className="w-full rounded-lg border border-brown/20 bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
              >
                <option value="">Todas</option>
                {publishers.map((publisher) => (
                  <option key={publisher} value={publisher}>
                    {publisher}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Category filter */}
          {categories.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-text-muted">Categoria</label>
              <select
                value={selectedCategory || ''}
                onChange={(e) => onCategoryChange(e.target.value || null)}
                className="w-full rounded-lg border border-brown/20 bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Tag filter */}
          {tags.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-text-muted">Tag</label>
              <select
                value={selectedTag || ''}
                onChange={(e) => onTagChange(e.target.value || null)}
                className="w-full rounded-lg border border-brown/20 bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
              >
                <option value="">Todas</option>
                {tags.map((tag) => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      )}

      {/* Active filter chips */}
      {hasActiveFilters && !isExpanded && (
        <div className="flex flex-wrap gap-2">
          {selectedStatus && (
            <FilterChip
              label={STATUS_LABELS[selectedStatus]}
              onRemove={() => onStatusChange(null)}
            />
          )}
          {selectedAuthor && (
            <FilterChip label={selectedAuthor} onRemove={() => onAuthorChange(null)} />
          )}
          {selectedPublisher && (
            <FilterChip label={selectedPublisher} onRemove={() => onPublisherChange(null)} />
          )}
          {selectedCategory && (
            <FilterChip label={selectedCategory} onRemove={() => onCategoryChange(null)} />
          )}
          {selectedTag && <FilterChip label={selectedTag} onRemove={() => onTagChange(null)} />}
        </div>
      )}
    </div>
  )
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-green-light/20 px-3 py-1 text-xs text-green-deep">
      {label}
      <button onClick={onRemove} className="hover:text-green-deep/70">
        <X className="h-3 w-3" />
      </button>
    </span>
  )
}
