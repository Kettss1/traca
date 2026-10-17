'use client'

import { useState, useCallback, useEffect, useRef, useMemo } from 'react'
import { Reorder, motion } from 'framer-motion'
import { updateShelfOrder } from '@/lib/actions/book'
import { AnimatedBookSpine } from './animated-book-spine'
import { SHELF_INNER_HEIGHT, packIntoRows, spineWidth } from './spine-style'

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
  onBookClick: (bookId: string) => void
}

const SHELF_PADDING_X = 20

export function ReorderableShelf({ books, onBookClick }: ReorderableShelfProps) {
  const [items, setItems] = useState(books)
  const [prevBooks, setPrevBooks] = useState(books)
  const [isDragging, setIsDragging] = useState(false)
  const [width, setWidth] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const latestItems = useRef(items)

  // filtros/ordenação mudam a lista vinda de fora: sincroniza durante o render
  if (books !== prevBooks) {
    setPrevBooks(books)
    setItems(books)
  }

  useEffect(() => {
    latestItems.current = items
  }, [items])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width) - SHELF_PADDING_X * 2)
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const rows = useMemo(
    () => packIntoRows(items, width, (ub) => spineWidth(ub.book.pageCount)),
    [items, width]
  )
  const rowStarts = useMemo(
    () =>
      rows.reduce<number[]>(
        (starts, _row, i) => [...starts, i === 0 ? 0 : starts[i - 1] + rows[i - 1].length],
        []
      ),
    [rows]
  )

  const saveOrder = useCallback(async (ordered: BookData[]) => {
    await updateShelfOrder(ordered.map((item, index) => ({ userBookId: item.id, position: index })))
  }, [])

  // cada prateleira reordena só os próprios livros; a ordem global é remontada a partir dela
  const handleRowReorder = (rowStart: number, rowLength: number, newRow: BookData[]) => {
    setItems((prev) => [...prev.slice(0, rowStart), ...newRow, ...prev.slice(rowStart + rowLength)])
  }

  const handleDragEnd = () => {
    setIsDragging(false)
    // salva quando o usuário solta o livro, não a cada pixel arrastado
    saveOrder(latestItems.current)
  }

  return (
    <div ref={containerRef}>
      {rows.map((rowBooks, rowIndex) => {
        const rowStart = rowStarts[rowIndex]
        return (
          <div key={rowIndex} className="relative">
            <div
              className="relative flex items-end"
              style={{ height: SHELF_INNER_HEIGHT + 12, paddingInline: SHELF_PADDING_X }}
            >
              {/* fundo da estante */}
              <motion.div
                aria-hidden
                className="absolute inset-0"
                style={{
                  background:
                    'repeating-linear-gradient(90deg, rgb(0 0 0 / 0.05) 0 1px, transparent 1px 46px), linear-gradient(180deg, #2c2017 0%, #3a2a1d 55%, #47331f 100%)',
                }}
                animate={{
                  boxShadow: isDragging
                    ? 'inset 0 10px 18px -8px rgb(0 0 0 / 0.6), inset 0 0 0 2px rgb(243 217 164 / 0.25)'
                    : 'inset 0 10px 18px -8px rgb(0 0 0 / 0.6)',
                }}
                transition={{ duration: 0.2 }}
              />

              {rowBooks.length > 0 ? (
                <Reorder.Group
                  axis="x"
                  values={rowBooks}
                  onReorder={(newRow) => handleRowReorder(rowStart, rowBooks.length, newRow)}
                  className="relative z-10 flex items-end"
                  style={{ gap: 3, height: SHELF_INNER_HEIGHT }}
                >
                  {rowBooks.map((userBook) => (
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
                <p className="relative z-10 w-full self-center text-center text-sm text-[#e9d8bd]/70">
                  Nenhum livro nesta prateleira
                </p>
              )}
            </div>

            {/* tábua */}
            <div
              aria-hidden
              className="relative h-3.5"
              style={{
                background: 'linear-gradient(180deg, #b8916a 0%, #9a7451 45%, #7c5b3e 100%)',
                boxShadow:
                  '0 6px 10px -2px rgb(0 0 0 / 0.45), inset 0 1px 0 rgb(255 255 255 / 0.3)',
              }}
            />
          </div>
        )
      })}
    </div>
  )
}

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
  const wasDragged = useRef(false)

  return (
    <Reorder.Item
      value={userBook}
      onDragStart={() => {
        wasDragged.current = true
        onDragStart()
      }}
      onDragEnd={() => {
        onDragEnd()
        // libera o clique só depois do evento de soltar
        requestAnimationFrame(() => {
          wasDragged.current = false
        })
      }}
      className="relative flex items-end"
      whileDrag={{ scale: 1.04, zIndex: 50 }}
      transition={{ duration: 0.25, ease: [0.32, 0.72, 0, 1] }}
    >
      <AnimatedBookSpine
        layoutId={`book-${userBook.book.id}`}
        title={userBook.book.title}
        authors={userBook.book.authors}
        colorPrimary={userBook.book.colorPrimary || undefined}
        colorSecondary={userBook.book.colorSecondary || undefined}
        pageCount={userBook.book.pageCount || undefined}
        coverUrl={userBook.book.coverUrl}
        onClick={() => {
          if (!wasDragged.current) onClick()
        }}
        isDraggable
      />
    </Reorder.Item>
  )
}
