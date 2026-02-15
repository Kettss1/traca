'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { Reorder, useDragControls, motion } from 'framer-motion'
import { updateShelfOrder } from '@/lib/actions/book'
import { AnimatedBookSpine } from './animated-book-spine'

interface BookData {
  id: string
  shelfPosition: number | null
  book: {
    id: string
    title: string
    authors: string[]
    colorPrimary: string | null
    colorSecondary: string | null
    pageCount: number | null
    coverUrl: string | null
  }
}

interface ReorderableShelfProps {
  books: BookData[]
  booksPerShelf?: number
  onBookClick: (bookId: string) => void
}

export function ReorderableShelf({
  books,
  booksPerShelf = 12,
  onBookClick,
}: ReorderableShelfProps) {
  const [items, setItems] = useState(books)
  const [isDragging, setIsDragging] = useState(false)

  // Sync items when books prop changes (filters, new books added, etc.)
  useEffect(() => {
    setItems(books)
  }, [books])

  // Debounced save function
  const saveOrder = useCallback(
    async (newItems: BookData[]) => {
      const orderData = newItems.map((item, index) => ({
        userBookId: item.id,
        position: index,
      }))
      await updateShelfOrder(orderData)
    },
    []
  )

  const handleReorder = (newItems: BookData[]) => {
    setItems(newItems)
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    saveOrder(items)
  }

  // Split books into shelves
  const shelves: BookData[][] = []
  for (let i = 0; i < items.length; i += booksPerShelf) {
    shelves.push(items.slice(i, i + booksPerShelf))
  }

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
            <motion.div
              className="absolute inset-0 rounded-t-sm"
              style={{
                background: 'linear-gradient(180deg, #5D4E3C 0%, #3D3228 100%)',
                boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.3)',
              }}
              animate={{
                boxShadow: isDragging
                  ? 'inset 0 -4px 12px rgba(0,0,0,0.4), inset 0 0 20px rgba(76, 112, 82, 0.2)'
                  : 'inset 0 -4px 8px rgba(0,0,0,0.3)',
              }}
            />

            {/* Books - Only first shelf is reorderable for simplicity */}
            {shelfIndex === 0 ? (
              <Reorder.Group
                axis="x"
                values={items}
                onReorder={handleReorder}
                className="relative z-10 flex h-[160px] items-end gap-[2px]"
              >
                {shelfBooks.map((userBook) => (
                  <ReorderableBook
                    key={userBook.id}
                    userBook={userBook}
                    onDragStart={() => setIsDragging(true)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onBookClick(userBook.book.id)}
                  />
                ))}
              </Reorder.Group>
            ) : (
              <div className="relative z-10 flex h-[160px] items-end gap-[2px]">
                {shelfBooks.map((userBook) => (
                  <AnimatedBookSpine
                    key={userBook.id}
                    layoutId={`book-${userBook.book.id}`}
                    title={userBook.book.title}
                    authors={userBook.book.authors}
                    colorPrimary={userBook.book.colorPrimary || undefined}
                    colorSecondary={userBook.book.colorSecondary || undefined}
                    pageCount={userBook.book.pageCount || undefined}
                    onClick={() => onBookClick(userBook.book.id)}
                  />
                ))}
              </div>
            )}

            {/* Empty shelf message */}
            {shelfBooks.length === 0 && (
              <div className="relative z-10 flex h-full w-full items-center justify-center">
                <p className="text-sm text-cream/60">Sua prateleira está vazia</p>
              </div>
            )}
          </div>

          {/* Shelf board */}
          <div
            className="relative h-4"
            style={{
              background: 'linear-gradient(180deg, #8B7355 0%, #6B5A47 50%, #5D4E3C 100%)',
              boxShadow: '0 4px 8px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.2)',
            }}
          >
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

          {/* Shelf brackets */}
          <div className="absolute -bottom-2 left-4 h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#5D4E3C] to-[#3D3228]" />
          <div className="absolute -bottom-2 right-4 h-6 w-3 rounded-b-sm bg-gradient-to-b from-[#5D4E3C] to-[#3D3228]" />
        </div>
      ))}

      {/* Drag hint */}
      <motion.p
        className="mt-4 text-center text-xs text-text-muted"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
      >
        Arraste os livros para reorganizar sua estante
      </motion.p>
    </div>
  )
}

// Individual reorderable book item
function ReorderableBook({
  userBook,
  onDragStart,
  onDragEnd,
  onClick,
}: {
  userBook: BookData
  onDragStart: () => void
  onDragEnd: () => void
  onClick: () => void
}) {
  const controls = useDragControls()
  const wasDragged = useRef(false)

  return (
    <Reorder.Item
      value={userBook}
      dragListener={true}
      dragControls={controls}
      onDragStart={() => {
        wasDragged.current = true
        onDragStart()
      }}
      onDragEnd={() => {
        onDragEnd()
        // Reset after a tick so the click handler can check it
        requestAnimationFrame(() => { wasDragged.current = false })
      }}
      className="h-full"
      whileDrag={{
        scale: 1.05,
        zIndex: 50,
        boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <AnimatedBookSpine
        layoutId={`book-${userBook.book.id}`}
        title={userBook.book.title}
        authors={userBook.book.authors}
        colorPrimary={userBook.book.colorPrimary || undefined}
        colorSecondary={userBook.book.colorSecondary || undefined}
        pageCount={userBook.book.pageCount || undefined}
        onClick={() => {
          if (!wasDragged.current) onClick()
        }}
        isDraggable
      />
    </Reorder.Item>
  )
}
