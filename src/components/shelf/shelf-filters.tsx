'use client'

import { Funnel, X } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

export type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'READ' | 'ABANDONED'

interface ShelfFiltersProps {
  authors: string[]
  publishers: string[]
  categories: string[]
  tags: string[]
  selectedAuthor: string | null
  selectedPublisher: string | null
  selectedCategory: string | null
  selectedTag: string | null
  onAuthorChange: (author: string | null) => void
  onPublisherChange: (publisher: string | null) => void
  onCategoryChange: (category: string | null) => void
  onTagChange: (tag: string | null) => void
  onClearAll: () => void
  isExpanded: boolean
}

export function ShelfFilters({
  authors,
  publishers,
  categories,
  tags,
  selectedAuthor,
  selectedPublisher,
  selectedCategory,
  selectedTag,
  onAuthorChange,
  onPublisherChange,
  onCategoryChange,
  onTagChange,
  onClearAll,
  isExpanded,
}: ShelfFiltersProps) {

  // status é controlado pelos chips; aqui só os filtros avançados
  const hasActiveFilters =
    selectedAuthor || selectedPublisher || selectedCategory || selectedTag

  return (
    <div className={cn("space-y-3", !isExpanded && !hasActiveFilters && "hidden")}>
      {/* Expanded filters */}
      {isExpanded && (
        <div className="grid gap-4 card p-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Author filter */}
          {authors.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-medium text-text-muted">Autor</label>
              <select
                value={selectedAuthor || ''}
                onChange={(e) => onAuthorChange(e.target.value || null)}
                className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
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
                className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
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
                className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
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
                className="w-full rounded-lg border border-line bg-cream px-3 py-2 text-sm text-text-dark focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
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
          <button
            type="button"
            onClick={onClearAll}
            className="text-text-muted hover:text-text-dark flex items-center gap-1 px-2 text-xs"
          >
            <X className="h-3 w-3" />
            Limpar
          </button>
        </div>
      )}
    </div>
  )
}

interface FiltersButtonProps {
  isExpanded: boolean
  activeCount: number
  onToggle: () => void
}

export function FiltersButton({ isExpanded, activeCount, onToggle }: FiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className={cn(
        'flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-medium transition-colors',
        isExpanded || activeCount > 0
          ? 'bg-green-deep text-on-brand border-transparent'
          : 'border-line bg-surface text-text-dark hover:bg-cream-dark'
      )}
    >
      <Funnel className="h-4 w-4" />
      <span className="hidden sm:inline">Filtros</span>
      {activeCount > 0 && (
        <span className="bg-on-brand/20 rounded-full px-1.5 text-xs tabular-nums">{activeCount}</span>
      )}
    </button>
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
