'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { List, Books } from '@phosphor-icons/react'
import { BookCard } from '@/components/book/book-card'
import { ShelfFilters, FiltersButton, ReadingStatus } from './shelf-filters'
import { StatusChips } from './status-chips'
import { ShelfSort, SortField, SortDirection } from './shelf-sort'
import { ShelfSearch } from './shelf-search'
import { AnimatedShelfView } from './animated-shelf-view'
import { cn } from '@/lib/utils'

interface UserBookWithBook {
  id: string
  status: ReadingStatus
  rating: number | null
  tags: string[]
  isReread: boolean
  createdAt: Date
  shelfPosition: number | null
  currentPage: number | null
  book: {
    id: string
    title: string
    subtitle: string | null
    authors: string[]
    coverUrl: string | null
    publisher: string | null
    pageCount: number | null
    colorPrimary: string | null
    colorSecondary: string | null
    categories: string[]
    synopsis: string | null
  }
  _count?: {
    rereads: number
  }
}

type ViewMode = 'list' | 'shelf'

interface ShelfContentProps {
  userBooks: UserBookWithBook[]
}

export function ShelfContent({ userBooks }: ShelfContentProps) {
  // View mode state
  const [viewMode, setViewMode] = useState<ViewMode>('shelf')
  const [filtersOpen, setFiltersOpen] = useState(false)

  // Search state
  const [searchQuery, setSearchQuery] = useState('')

  // Filter state
  const [selectedStatus, setSelectedStatus] = useState<ReadingStatus | null>(null)
  const [selectedAuthor, setSelectedAuthor] = useState<string | null>(null)
  const [selectedPublisher, setSelectedPublisher] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedTag, setSelectedTag] = useState<string | null>(null)

  // Sort state
  const [sortField, setSortField] = useState<SortField>('createdAt')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')

  // Extract unique values for filter dropdowns
  const filterOptions = useMemo(() => {
    const authors = new Set<string>()
    const publishers = new Set<string>()
    const categories = new Set<string>()
    const tags = new Set<string>()

    userBooks.forEach((ub) => {
      ub.book.authors.forEach((a) => authors.add(a))
      if (ub.book.publisher) publishers.add(ub.book.publisher)
      ub.book.categories.forEach((c) => categories.add(c))
      ub.tags.forEach((t) => tags.add(t))
    })

    return {
      authors: Array.from(authors).sort(),
      publishers: Array.from(publishers).sort(),
      categories: Array.from(categories).sort(),
      tags: Array.from(tags).sort(),
    }
  }, [userBooks])

  // Filter and sort books
  const filteredBooks = useMemo(() => {
    let result = [...userBooks]

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      result = result.filter(
        (ub) =>
          ub.book.title.toLowerCase().includes(query) ||
          ub.book.authors.some((a) => a.toLowerCase().includes(query)) ||
          (ub.book.publisher && ub.book.publisher.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (selectedStatus) {
      result = result.filter((ub) => ub.status === selectedStatus)
    }

    // Apply author filter
    if (selectedAuthor) {
      result = result.filter((ub) => ub.book.authors.includes(selectedAuthor))
    }

    // Apply publisher filter
    if (selectedPublisher) {
      result = result.filter((ub) => ub.book.publisher === selectedPublisher)
    }

    // Apply category filter
    if (selectedCategory) {
      result = result.filter((ub) => ub.book.categories.includes(selectedCategory))
    }

    // Apply tag filter
    if (selectedTag) {
      result = result.filter((ub) => ub.tags.includes(selectedTag))
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case 'title':
          comparison = a.book.title.localeCompare(b.book.title, 'pt-BR')
          break
        case 'author':
          const authorA = a.book.authors[0] || ''
          const authorB = b.book.authors[0] || ''
          comparison = authorA.localeCompare(authorB, 'pt-BR')
          break
        case 'createdAt':
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
        case 'rating':
          comparison = (a.rating || 0) - (b.rating || 0)
          break
      }

      return sortDirection === 'asc' ? comparison : -comparison
    })

    return result
  }, [
    userBooks,
    searchQuery,
    selectedStatus,
    selectedAuthor,
    selectedPublisher,
    selectedCategory,
    selectedTag,
    sortField,
    sortDirection,
  ])

  const statusCounts = useMemo(() => {
    const counts: Record<ReadingStatus, number> = { READING: 0, READ: 0, WANT_TO_READ: 0, ABANDONED: 0 }
    userBooks.forEach((ub) => {
      counts[ub.status] += 1
    })
    return counts
  }, [userBooks])

  const advancedFilterCount = [selectedAuthor, selectedPublisher, selectedCategory, selectedTag].filter(
    Boolean
  ).length

  const handleClearFilters = () => {
    setSelectedAuthor(null)
    setSelectedPublisher(null)
    setSelectedCategory(null)
    setSelectedTag(null)
  }

  const handleSortChange = (field: SortField, direction: SortDirection) => {
    setSortField(field)
    setSortDirection(direction)
  }

  return (
    <div className="space-y-6">
      <StatusChips
        counts={statusCounts}
        total={userBooks.length}
        selected={selectedStatus}
        onChange={setSelectedStatus}
      />

      {/* Busca, filtros, ordenação e modo de visualização */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[200px] flex-1">
          <ShelfSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <FiltersButton
          isExpanded={filtersOpen}
          activeCount={advancedFilterCount}
          onToggle={() => setFiltersOpen((open) => !open)}
        />
        <ShelfSort
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
        <div className="border-line bg-surface flex h-10 rounded-lg border p-1" role="group" aria-label="Modo de visualização">
          {([
            { mode: 'shelf' as const, label: 'Estante', icon: Books },
            { mode: 'list' as const, label: 'Lista', icon: List },
          ]).map(({ mode, label, icon: Icon }) => (
            <button
              key={mode}
              type="button"
              onClick={() => setViewMode(mode)}
              aria-pressed={viewMode === mode}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-2.5 text-sm transition-colors',
                viewMode === mode ? 'bg-green-deep text-on-brand' : 'text-text-muted hover:text-text-dark'
              )}
              title={`Ver como ${label.toLowerCase()}`}
            >
              <Icon className="h-4 w-4" weight={viewMode === mode ? 'fill' : 'regular'} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      <ShelfFilters
        authors={filterOptions.authors}
        publishers={filterOptions.publishers}
        categories={filterOptions.categories}
        tags={filterOptions.tags}
        selectedAuthor={selectedAuthor}
        selectedPublisher={selectedPublisher}
        selectedCategory={selectedCategory}
        selectedTag={selectedTag}
        onAuthorChange={setSelectedAuthor}
        onPublisherChange={setSelectedPublisher}
        onCategoryChange={setSelectedCategory}
        onTagChange={setSelectedTag}
        onClearAll={handleClearFilters}
        isExpanded={filtersOpen}
      />

      {/* Results count */}
      {(searchQuery || selectedStatus || selectedAuthor || selectedPublisher || selectedCategory || selectedTag) && (
        <p className="text-sm text-text-muted">
          {filteredBooks.length} livro{filteredBooks.length !== 1 && 's'} encontrado
          {filteredBooks.length !== 1 && 's'}
        </p>
      )}

      {/* Book display */}
      {filteredBooks.length > 0 ? (
        viewMode === 'list' ? (
          <div className="space-y-2">
            {filteredBooks.map((userBook) => {
              const rereadCount = (userBook._count?.rereads || 0) + 1
              return (
                <Link key={userBook.id} href={`/book/${userBook.book.id}`}>
                  <BookCard
                    title={userBook.book.title}
                    authors={userBook.book.authors}
                    coverUrl={userBook.book.coverUrl || undefined}
                    currentPage={userBook.status === 'READING' ? userBook.currentPage : undefined}
                    pageCount={userBook.book.pageCount || undefined}
                    colorPrimary={userBook.book.colorPrimary || undefined}
                    status={userBook.status}
                    rating={userBook.rating}
                    rereadCount={rereadCount > 1 ? rereadCount : undefined}
                  />
                </Link>
              )
            })}
          </div>
        ) : (
          <AnimatedShelfView books={filteredBooks} />
        )
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-line py-16">
          <p className="text-text-muted">Nenhum livro encontrado com os filtros selecionados.</p>
        </div>
      )}
    </div>
  )
}
