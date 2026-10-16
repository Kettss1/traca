'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { List, SquaresFour } from '@phosphor-icons/react'
import { BookCard } from '@/components/book/book-card'
import { ShelfFilters, ReadingStatus } from './shelf-filters'
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
  const [viewMode, setViewMode] = useState<ViewMode>('list')

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

  const handleClearFilters = () => {
    setSelectedStatus(null)
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
      {/* Search and View Mode Toggle */}
      <div className="flex gap-4">
        <div className="flex-1">
          <ShelfSearch value={searchQuery} onChange={setSearchQuery} />
        </div>
        <div className="flex card p-1">
          <button
            onClick={() => setViewMode('list')}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors',
              viewMode === 'list'
                ? 'bg-green-deep text-on-brand'
                : 'text-text-muted hover:text-text-dark'
            )}
            title="Visualização em lista"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </button>
          <button
            onClick={() => setViewMode('shelf')}
            className={cn(
              'flex items-center gap-1 rounded-md px-3 py-1.5 text-sm transition-colors',
              viewMode === 'shelf'
                ? 'bg-green-deep text-on-brand'
                : 'text-text-muted hover:text-text-dark'
            )}
            title="Visualização em estante"
          >
            <SquaresFour className="h-4 w-4" />
            <span className="hidden sm:inline">Estante</span>
          </button>
        </div>
      </div>

      {/* Filters and Sort */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <ShelfFilters
          authors={filterOptions.authors}
          publishers={filterOptions.publishers}
          categories={filterOptions.categories}
          tags={filterOptions.tags}
          selectedStatus={selectedStatus}
          selectedAuthor={selectedAuthor}
          selectedPublisher={selectedPublisher}
          selectedCategory={selectedCategory}
          selectedTag={selectedTag}
          onStatusChange={setSelectedStatus}
          onAuthorChange={setSelectedAuthor}
          onPublisherChange={setSelectedPublisher}
          onCategoryChange={setSelectedCategory}
          onTagChange={setSelectedTag}
          onClearAll={handleClearFilters}
        />

        <ShelfSort
          sortField={sortField}
          sortDirection={sortDirection}
          onSortChange={handleSortChange}
        />
      </div>

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
          <div className="space-y-4">
            {filteredBooks.map((userBook) => {
              const rereadCount = (userBook._count?.rereads || 0) + 1
              return (
                <Link key={userBook.id} href={`/book/${userBook.book.id}`}>
                  <BookCard
                    title={userBook.book.title}
                    authors={userBook.book.authors}
                    coverUrl={userBook.book.coverUrl || undefined}
                    publisher={userBook.book.publisher || undefined}
                    pageCount={userBook.book.pageCount || undefined}
                    colorPrimary={userBook.book.colorPrimary || undefined}
                    status={userBook.status}
                    rating={userBook.rating}
                    rereadCount={rereadCount > 1 ? rereadCount : undefined}
                    className="hover:scale-[1.01]"
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
