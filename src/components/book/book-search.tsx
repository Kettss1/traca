'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { MagnifyingGlass, BookOpen, User } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { Spinner } from '@/components/ui/spinner'
import { BookCard } from '@/components/book/book-card'
import { track } from '@vercel/analytics'
import { addBookToShelf } from '@/lib/actions/book'
import { cn } from '@/lib/utils'
import { spinePalette } from '@/components/shelf/spine-style'

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

export interface SearchSuggestions {
  popular: { id: string; title: string; authors: string[]; coverUrl: string | null; colorPrimary: string | null }[]
  authors: string[]
}

interface BookSearchProps {
  userBookIds?: string[] // IDs of books already in shelf
  suggestions?: SearchSuggestions
  onBookAdded?: () => void
  className?: string
}

type SearchMode = 'title' | 'author'

export function BookSearch({ userBookIds = [], suggestions, onBookAdded, className }: BookSearchProps) {
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
      track('book_searched', { mode: searchMode, results_count: data.results.length })
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

  // atalho dos estados vazios: preenche a busca e dispara na hora
  const runSuggestion = (text: string, newMode: SearchMode) => {
    setMode(newMode)
    setQuery(text)
    search(text, newMode)
    window.scrollTo({ top: 0, behavior: 'smooth' })
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
      track('book_added_to_shelf', { status, title: book.title })
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
              ? 'bg-green-deep text-on-brand'
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
              ? 'bg-green-deep text-on-brand'
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

      {/* Estado inicial: sugestões em vez de tela vazia */}
      {!isLoading && !searchedQuery && results.length === 0 && (
        <div className="mt-10 space-y-10">
          {suggestions && suggestions.popular.length > 0 && (
            <section>
              <h2 className="section-title mb-4">Populares entre leitores do Traça</h2>
              <ul className="grid grid-cols-3 gap-4 sm:grid-cols-4 md:grid-cols-6">
                {suggestions.popular.map((book) => (
                  <li key={book.id}>
                    <button
                      type="button"
                      onClick={() => runSuggestion(book.title, 'title')}
                      className="group w-full text-left"
                    >
                      <span
                        className="relative block aspect-[2/3] overflow-hidden rounded-md shadow-[0_8px_18px_-10px_rgb(0_0_0/0.45)] transition-transform duration-200 group-hover:-translate-y-1"
                        style={{ backgroundColor: book.colorPrimary || 'var(--cream-dark)' }}
                      >
                        {book.coverUrl ? (
                          // capa externa (Google Books / Open Library)
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={book.coverUrl} alt="" className="h-full w-full object-cover" loading="lazy" />
                        ) : (
                          <span
                            className="font-fraunces flex h-full items-center justify-center p-2 text-center text-sm"
                            style={{ color: spinePalette(book.colorPrimary).text }}
                          >
                            {book.title}
                          </span>
                        )}
                      </span>
                      <span className="text-text-dark mt-2 line-clamp-2 block text-sm font-medium">{book.title}</span>
                      <span className="text-text-muted block truncate text-xs">{book.authors[0]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {suggestions && suggestions.authors.length > 0 && (
            <section>
              <h2 className="section-title mb-4">Mais de quem você já lê</h2>
              <div className="flex flex-wrap gap-2">
                {suggestions.authors.map((author) => (
                  <button
                    key={author}
                    type="button"
                    onClick={() => runSuggestion(author, 'author')}
                    className="border-line bg-surface text-text-dark hover:border-green-deep/40 flex items-center gap-1.5 rounded-full border px-4 py-1.5 text-sm transition-colors"
                  >
                    <User className="text-text-muted h-4 w-4" />
                    {author}
                  </button>
                ))}
              </div>
            </section>
          )}

          {(!suggestions || (suggestions.popular.length === 0 && suggestions.authors.length === 0)) && (
            <div className="text-text-muted text-center">
              <MagnifyingGlass className="mx-auto h-12 w-12 opacity-40" />
              <p className="mt-4">Digite o nome de um livro ou autor para começar</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
