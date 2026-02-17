'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MagnifyingGlass, BookOpen, User } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { BookCard } from '@/components/book/book-card'
import { addBookToShelf } from '@/lib/actions/book'
import { cn } from '@/lib/utils'

interface BookSearchResult {
  googleBooksId?: string
  openLibraryKey?: string
  title: string
  subtitle?: string
  authors: string[]
  publisher?: string
  publishedDate?: string
  synopsis?: string
  pageCount?: number
  categories: string[]
  coverUrl?: string
  isbn10?: string
  isbn13?: string
}

interface BookSearchProps {
  userBookIds?: string[] // IDs of books already in shelf
  onBookAdded?: () => void
  className?: string
}

type SearchMode = 'title' | 'author'

export function BookSearch({ userBookIds = [], onBookAdded, className }: BookSearchProps) {
  const [query, setQuery] = useState('')
  const [mode, setMode] = useState<SearchMode>('title')
  const [searchedQuery, setSearchedQuery] = useState('')
  const [results, setResults] = useState<BookSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [addingBookId, setAddingBookId] = useState<string | null>(null)
  const [addedBooks, setAddedBooks] = useState<Set<string>>(new Set())

  const searchRef = useRef<AbortController | null>(null)

  const search = useCallback(async (searchQuery: string, searchMode: SearchMode) => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < 3) {
      setResults([])
      setSearchedQuery('')
      return
    }

    searchRef.current?.abort()
    const controller = new AbortController()
    searchRef.current = controller

    setIsLoading(true)
    setError(null)
    setSearchedQuery(trimmed)

    try {
      const params = new URLSearchParams({ q: trimmed, mode: searchMode })
      const response = await fetch(`/api/books/search?${params}`, {
        signal: controller.signal,
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erro ao buscar livros')
      }

      setResults(data.results)
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return
      setError(err instanceof Error ? err.message : 'Erro ao buscar livros')
      setResults([])
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Debounce: 1s delay gives time to finish typing a word
  // Enter always triggers immediately
  useEffect(() => {
    if (query.trim().length < 3) return

    const timeoutId = setTimeout(() => {
      search(query, mode)
    }, 1000)

    return () => clearTimeout(timeoutId)
  }, [query, mode, search])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    search(query, mode)
  }

  const handleModeChange = (newMode: SearchMode) => {
    setMode(newMode)
    setQuery('')
    setResults([])
    setSearchedQuery('')
    setError(null)
  }

  const handleAddBook = async (book: BookSearchResult, status: 'WANT_TO_READ' | 'READING' | 'READ' | 'ABANDONED') => {
    const bookId = book.googleBooksId || book.openLibraryKey || book.title
    setAddingBookId(bookId)

    const result = await addBookToShelf({
      title: book.title,
      subtitle: book.subtitle,
      authors: book.authors,
      publisher: book.publisher,
      publishedDate: book.publishedDate,
      synopsis: book.synopsis,
      pageCount: book.pageCount,
      categories: book.categories,
      coverUrl: book.coverUrl,
      isbn10: book.isbn10,
      isbn13: book.isbn13,
      googleBooksId: book.googleBooksId,
      openLibraryKey: book.openLibraryKey,
      status,
      tags: [],
    })

    setAddingBookId(null)

    if (result.success) {
      setAddedBooks((prev) => new Set(prev).add(bookId))
      onBookAdded?.()
    } else {
      setError(result.error)
    }
  }

  const isBookInShelf = (book: BookSearchResult) => {
    const bookId = book.googleBooksId || book.openLibraryKey || book.title
    return addedBooks.has(bookId) || userBookIds.includes(bookId)
  }

  return (
    <div className={cn('w-full', className)}>
      {/* Search mode toggle */}
      <div className="mb-3 flex gap-2">
        <button
          type="button"
          onClick={() => handleModeChange('title')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'title'
              ? 'bg-green-deep text-cream'
              : 'bg-cream-dark text-text-muted hover:text-text-dark'
          )}
        >
          <BookOpen className="h-4 w-4" weight={mode === 'title' ? 'fill' : 'regular'} />
          Título
        </button>
        <button
          type="button"
          onClick={() => handleModeChange('author')}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            mode === 'author'
              ? 'bg-green-deep text-cream'
              : 'bg-cream-dark text-text-muted hover:text-text-dark'
          )}
        >
          <User className="h-4 w-4" weight={mode === 'author' ? 'fill' : 'regular'} />
          Autor
        </button>
      </div>

      {/* Search input */}
      <form onSubmit={handleSubmit} className="relative">
        <MagnifyingGlass className="text-text-muted absolute top-1/2 left-3 h-5 w-5 -translate-y-1/2" />
        <Input
          type="search"
          placeholder={mode === 'title' ? 'Buscar por título...' : 'Buscar por autor...'}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10"
        />
      </form>

      {/* Error */}
      {error && <div className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>}

      {/* Loading */}
      {isLoading && (
        <div className="mt-8 flex justify-center">
          <Spinner size="lg" className="text-green-deep" />
        </div>
      )}

      {/* Results */}
      {!isLoading && results.length > 0 && (
        <div className="mt-6 space-y-4">
          <p className="text-text-muted text-sm">
            {results.length} resultado{results.length !== 1 && 's'} encontrado
            {results.length !== 1 && 's'}
          </p>
          <div className="space-y-3">
            {results.map((book) => {
              const bookId = book.googleBooksId || book.openLibraryKey || book.title
              return (
                <BookCard
                  key={bookId}
                  title={book.title}
                  authors={book.authors}
                  coverUrl={book.coverUrl}
                  publisher={book.publisher}
                  pageCount={book.pageCount}
                  isInShelf={isBookInShelf(book)}
                  onAdd={addingBookId === bookId ? undefined : (status) => handleAddBook(book, status)}
                />
              )
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && searchedQuery && results.length === 0 && !error && (
        <div className="text-text-muted mt-8 text-center">
          <p>Nenhum livro encontrado para &quot;{searchedQuery}&quot;</p>
          <p className="mt-1 text-sm">Tente buscar por outro título ou autor</p>
        </div>
      )}

      {/* Initial state */}
      {!isLoading && !searchedQuery && results.length === 0 && (
        <div className="text-text-muted mt-8 text-center">
          <MagnifyingGlass className="mx-auto h-12 w-12 opacity-40" />
          <p className="mt-4">Digite o nome de um livro ou autor para começar</p>
        </div>
      )}
    </div>
  )
}
