'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { X, BookOpen, Star, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface BookModalProps {
  book: {
    id: string
    title: string
    subtitle?: string | null
    authors: string[]
    coverUrl?: string | null
    colorPrimary?: string | null
    colorSecondary?: string | null
    pageCount?: number | null
    publisher?: string | null
    synopsis?: string | null
  } | null
  userBook?: {
    status: string
    rating: number | null
    currentPage: number | null
  } | null
  isOpen: boolean
  onClose: () => void
}

const STATUS_LABELS: Record<string, string> = {
  WANT_TO_READ: 'Quero Ler',
  READING: 'Lendo',
  READ: 'Lido',
  ABANDONED: 'Abandonado',
}

export function BookModal({ book, userBook, isOpen, onClose }: BookModalProps) {
  const prefersReducedMotion = useReducedMotion()

  // Close on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = ''
    }
  }, [isOpen, onClose])

  if (!book) return null

  const bgColor = book.colorPrimary || '#8B7355'

  // Simplified animations for reduced motion preference
  const modalAnimation = prefersReducedMotion
    ? {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.15 } as const,
      }
    : {
        initial: { opacity: 0, scale: 0.9, rotateY: -15 },
        animate: { opacity: 1, scale: 1, rotateY: 0 },
        exit: { opacity: 0, scale: 0.9, rotateY: -15 },
        transition: { type: 'spring' as const, stiffness: 300, damping: 30 },
      }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            className="fixed inset-4 z-50 m-auto flex max-h-[90vh] max-w-4xl overflow-hidden rounded-2xl bg-cream shadow-2xl md:inset-8"
            initial={modalAnimation.initial}
            animate={modalAnimation.animate}
            exit={modalAnimation.exit}
            transition={modalAnimation.transition}
            style={{ perspective: '1200px' }}
          >
            {/* Book cover side (left) */}
            <motion.div
              layoutId={`book-${book.id}`}
              className="relative hidden w-1/3 flex-shrink-0 md:block"
              style={{
                background: book.colorSecondary
                  ? `linear-gradient(135deg, ${bgColor} 0%, ${book.colorSecondary} 100%)`
                  : bgColor,
              }}
            >
              {book.coverUrl ? (
                <Image
                  src={book.coverUrl}
                  alt={book.title}
                  fill
                  className="object-cover"
                  sizes="300px"
                />
              ) : (
                <div className="flex h-full items-center justify-center">
                  <BookOpen className="h-20 w-20 text-white/40" />
                </div>
              )}

              {/* Gradient overlay at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black/60 to-transparent" />

              {/* Book spine effect */}
              <div className="absolute right-0 top-0 h-full w-4 bg-gradient-to-r from-black/20 to-transparent" />
            </motion.div>

            {/* Content side (right) */}
            <motion.div
              className="flex flex-1 flex-col overflow-hidden"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
            >
              {/* Header */}
              <div className="flex items-start justify-between border-b border-line p-6">
                <div className="flex-1 pr-4">
                  <motion.h2
                    className="font-fraunces text-2xl font-bold text-text-dark"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    {book.title}
                  </motion.h2>
                  {book.subtitle && (
                    <motion.p
                      className="mt-1 text-text-muted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.25 }}
                    >
                      {book.subtitle}
                    </motion.p>
                  )}
                  {book.authors.length > 0 && (
                    <motion.p
                      className="mt-2 text-sm text-text-muted"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      por <span className="font-medium">{book.authors.join(', ')}</span>
                    </motion.p>
                  )}
                </div>
                <button
                  onClick={onClose}
                  className="rounded-full p-2 text-text-muted transition-colors hover:bg-cream-dark hover:text-text-dark"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Body */}
              <div className="flex-1 overflow-y-auto p-6">
                {/* User book info */}
                {userBook && (
                  <motion.div
                    className="mb-6 flex flex-wrap items-center gap-3"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                  >
                    <span
                      className={cn(
                        'rounded-full px-3 py-1 text-sm font-medium',
                        userBook.status === 'READ' && 'bg-green-deep/10 text-green-deep',
                        userBook.status === 'READING' && 'bg-green-light/20 text-green-deep',
                        userBook.status === 'WANT_TO_READ' && 'bg-terracotta/10 text-terracotta',
                        userBook.status === 'ABANDONED' && 'bg-brown/10 text-text-muted'
                      )}
                    >
                      {STATUS_LABELS[userBook.status] || userBook.status}
                    </span>
                    {userBook.rating && (
                      <span className="flex items-center gap-1 text-terracotta">
                        <Star weight="fill" className="h-4 w-4" />
                        {userBook.rating.toFixed(1)}
                      </span>
                    )}
                    {userBook.currentPage && book.pageCount && (
                      <span className="text-sm text-text-muted">
                        Página {userBook.currentPage} de {book.pageCount}
                      </span>
                    )}
                  </motion.div>
                )}

                {/* Book metadata */}
                <motion.div
                  className="mb-6 flex flex-wrap gap-4 text-sm text-text-muted"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  {book.publisher && <span>{book.publisher}</span>}
                  {book.pageCount && <span>{book.pageCount} páginas</span>}
                </motion.div>

                {/* Synopsis */}
                {book.synopsis && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.45 }}
                  >
                    <h3 className="mb-2 font-medium text-text-dark">Sinopse</h3>
                    <p className="line-clamp-6 whitespace-pre-line text-sm leading-relaxed text-text-muted">
                      {book.synopsis}
                    </p>
                  </motion.div>
                )}
              </div>

              {/* Footer */}
              <motion.div
                className="border-t border-line p-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Link
                  href={`/book/${book.id}`}
                  className="inline-flex items-center gap-2 rounded-lg bg-green-deep px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-green-deep/90"
                  onClick={onClose}
                >
                  Ver página completa
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
