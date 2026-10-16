'use client'

import { useRouter } from 'next/navigation'
import { BookSpine } from './book-spine'

interface BookData {
  id: string
  book: {
    id: string
    title: string
    authors: string[]
    colorPrimary: string | null
    colorSecondary: string | null
    pageCount: number | null
  }
}

interface VisualShelfProps {
  books: BookData[]
  booksPerShelf?: number
}

export function VisualShelf({ books, booksPerShelf = 12 }: VisualShelfProps) {
  const router = useRouter()

  // Split books into shelves
  const shelves: BookData[][] = []
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf))
  }

  // Add empty shelf if no books
  if (shelves.length === 0) {
    shelves.push([])
  }

  return (
    <div className="space-y-0">
      {shelves.map((shelfBooks, shelfIndex) => (
        <div key={shelfIndex} className="relative">
          {/* Shelf with books */}
          <div className="relative flex h-48 items-end gap-1 px-4 pb-2">
            {/* Back panel */}
            <div
              className="absolute inset-0 rounded-t-sm"
              style={{
                background: 'linear-gradient(180deg, #5D4E3C 0%, #3D3228 100%)',
                boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
              }}
            />

            {/* Books */}
            <div className="relative z-10 flex h-[160px] items-end gap-[2px]">
              {shelfBooks.map((userBook) => (
                <BookSpine
                  key={userBook.id}
                  title={userBook.book.title}
                  authors={userBook.book.authors}
                  colorPrimary={userBook.book.colorPrimary || undefined}
                  colorSecondary={userBook.book.colorSecondary || undefined}
                  pageCount={userBook.book.pageCount || undefined}
                  onClick={() => router.push(`/book/${userBook.book.id}`)}
                />
              ))}

              {/* Empty shelf message */}
              {shelfBooks.length === 0 && (
                <div className="flex h-full w-full items-center justify-center">
                  <p className="text-sm text-on-brand/60">Sua prateleira está vazia</p>
                </div>
              )}
            </div>
          </div>

          {/* Shelf board */}
          <div
            className="relative h-4"
            style={{
              background: 'linear-gradient(180deg, #8B7355 0%, #6B5A47 50%, #5D4E3C 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
            {/* Wood grain texture */}
            <div
              className="absolute inset-0 opacity-30"
              style={{
                backgroundImage: `repeating-linear-gradient(
                  90deg,
                  transparent,
                  transparent 20px,
                  rgba(0,0,0,0.1) 20px,
                  rgba(0,0,0,0.1) 21px
                )`,
              }}
            />
          </div>

          {/* Shelf bracket decorations */}
          <div className="absolute -bottom-2 left-4 h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#5D4E3C] to-[#3D3228]" />
          <div className="absolute -bottom-2 right-4 h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#5D4E3C] to-[#3D3228]" />
        </div>
      ))}
    </div>
  )
}
