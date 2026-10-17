'use client'

import { useState, useTransition } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { CheckCircle, PencilSimple } from '@phosphor-icons/react'
import { updateReadingProgress, updateUserBook } from '@/lib/actions/book'
import { cn } from '@/lib/utils'

const EASE = [0.32, 0.72, 0, 1] as const

export interface CurrentlyReadingBook {
  id: string
  currentPage: number | null
  book: {
    id: string
    title: string
    authors: string[]
    coverUrl: string | null
    pageCount: number | null
    colorPrimary: string | null
  }
}

interface CurrentlyReadingProps {
  books: CurrentlyReadingBook[]
}

export function CurrentlyReading({ books }: CurrentlyReadingProps) {
  if (books.length === 0) return null

  return (
    <section aria-labelledby="lendo-agora" className="mb-10">
      <h2 id="lendo-agora" className="section-title mb-4">
        Lendo agora
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {books.map((userBook) => (
          <ReadingCard key={userBook.id} userBook={userBook} />
        ))}
      </div>
    </section>
  )
}

function ReadingCard({ userBook }: { userBook: CurrentlyReadingBook }) {
  const router = useRouter()
  const reduceMotion = useReducedMotion()
  const [isEditing, setIsEditing] = useState(false)
  const [page, setPage] = useState(String(userBook.currentPage ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [reachedEnd, setReachedEnd] = useState(false)
  const [isPending, startTransition] = useTransition()

  const { book } = userBook
  const current = userBook.currentPage ?? 0
  const progress = book.pageCount ? Math.min(100, Math.round((current / book.pageCount) * 100)) : null

  const save = () => {
    const value = Number.parseInt(page, 10)
    if (Number.isNaN(value) || value < 0) {
      setError('Digite um número de página válido')
      return
    }
    setError(null)
    startTransition(async () => {
      const result = await updateReadingProgress({ userBookId: userBook.id, currentPage: value })
      if (!result.success) {
        setError(result.error)
        return
      }
      setIsEditing(false)
      setReachedEnd(result.data.reachedEnd)
      router.refresh()
    })
  }

  const markAsRead = () => {
    startTransition(async () => {
      const result = await updateUserBook({ userBookId: userBook.id, status: 'READ' })
      if (result.success) router.refresh()
      else setError(result.error)
    })
  }

  return (
    <article className="card flex gap-4 p-4">
      <Link
        href={`/book/${book.id}`}
        className="relative h-36 w-24 shrink-0 overflow-hidden rounded-md shadow-[0_6px_16px_-6px_rgb(0_0_0/0.35)]"
        style={{ backgroundColor: book.colorPrimary || 'var(--green-deep)' }}
      >
        {book.coverUrl ? (
          <Image src={book.coverUrl} alt={`Capa de ${book.title}`} fill sizes="96px" className="object-cover" />
        ) : (
          <span className="font-fraunces text-on-brand flex h-full items-center justify-center p-2 text-center text-xs">
            {book.title}
          </span>
        )}
      </Link>

      <div className="flex min-w-0 flex-1 flex-col">
        <Link href={`/book/${book.id}`} className="hover:underline">
          <h3 className="font-fraunces text-text-dark line-clamp-2 text-lg leading-snug font-semibold">
            {book.title}
          </h3>
        </Link>
        <p className="text-text-muted truncate text-sm">{book.authors.join(', ')}</p>

        <div className="mt-auto pt-3">
          {progress !== null && (
            <div
              className="bg-cream-dark h-2 overflow-hidden rounded-full"
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`Progresso de ${book.title}`}
            >
              <motion.div
                className="bg-green-deep h-full rounded-full"
                initial={reduceMotion ? false : { width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: reduceMotion ? 0 : 0.5, ease: EASE }}
              />
            </div>
          )}

          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.form
                key="form"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="mt-2 flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault()
                  save()
                }}
              >
                <label htmlFor={`page-${userBook.id}`} className="text-text-muted text-sm">
                  Página
                </label>
                <input
                  id={`page-${userBook.id}`}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  max={book.pageCount ?? undefined}
                  value={page}
                  onChange={(e) => setPage(e.target.value)}
                  autoFocus
                  className="border-line bg-cream text-text-dark focus:ring-green-deep/30 w-20 rounded-lg border px-2 py-1 text-sm tabular-nums focus:ring-2 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isPending}
                  className="bg-green-deep text-on-brand rounded-lg px-3 py-1 text-sm font-medium disabled:opacity-60"
                >
                  {isPending ? 'Salvando…' : 'Salvar'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsEditing(false)
                    setError(null)
                  }}
                  className="text-text-muted hover:text-text-dark text-sm"
                >
                  Cancelar
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="summary"
                initial={reduceMotion ? false : { opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? undefined : { opacity: 0, y: -4 }}
                transition={{ duration: 0.2, ease: EASE }}
                className="mt-2 flex items-center justify-between gap-2"
              >
                <span className="text-text-muted text-sm whitespace-nowrap tabular-nums">
                  pág. {current}
                  {book.pageCount ? ` de ${book.pageCount}` : ''}
                  {progress !== null && <span className="hidden sm:inline"> · {progress}%</span>}
                </span>
                <button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  className="text-green-deep hover:bg-green-deep/10 flex items-center gap-1 rounded-lg px-2 py-1 text-sm font-medium transition-colors"
                >
                  <PencilSimple className="h-4 w-4" />
                  Atualizar
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <p role="alert" className="mt-1 text-sm text-red-600">
              {error}
            </p>
          )}

          {reachedEnd && (
            <button
              type="button"
              onClick={markAsRead}
              disabled={isPending}
              className={cn(
                'bg-terracotta text-on-brand mt-2 flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium',
                'disabled:opacity-60'
              )}
            >
              <CheckCircle className="h-4 w-4" weight="fill" />
              Chegou ao fim — marcar como lido
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
