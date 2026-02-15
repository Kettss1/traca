'use client'

import { useMemo } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { LayoutGroup } from 'framer-motion'
import { ReorderableShelf } from './reorderable-shelf'
import { BookModal } from './book-modal'

interface BookData {
  id: string
  shelfPosition: number | null
  status: string
  rating: number | null
  currentPage: number | null
  book: {
    id: string
    title: string
    subtitle: string | null
    authors: string[]
    colorPrimary: string | null
    colorSecondary: string | null
    pageCount: number | null
    coverUrl: string | null
    publisher: string | null
    synopsis: string | null
  }
}

interface AnimatedShelfViewProps {
  books: BookData[]
}

export function AnimatedShelfView({ books }: AnimatedShelfViewProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Derive selected book from URL params directly
  const selectedBookId = searchParams.get('book')

  const selectedUserBook = useMemo(
    () => (selectedBookId ? books.find((b) => b.book.id === selectedBookId) : null),
    [selectedBookId, books]
  )

  const handleBookClick = (bookId: string) => {
    router.push(`?book=${bookId}`, { scroll: false })
  }

  const handleCloseModal = () => {
    router.push('/shelf', { scroll: false })
  }

  return (
    <LayoutGroup>
      <div className="rounded-lg bg-[#2D2A26] p-6 shadow-lg">
        <ReorderableShelf
          books={books}
          onBookClick={handleBookClick}
        />
      </div>

      <BookModal
        book={selectedUserBook?.book || null}
        userBook={selectedUserBook ? {
          status: selectedUserBook.status,
          rating: selectedUserBook.rating,
          currentPage: selectedUserBook.currentPage,
        } : null}
        isOpen={!!selectedBookId}
        onClose={handleCloseModal}
      />
    </LayoutGroup>
  )
}
