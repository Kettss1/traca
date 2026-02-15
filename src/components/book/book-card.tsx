'use client'

import Image from 'next/image'
import { cn } from '@/lib/utils'
import { BookOpen, Plus, Check, Star, ArrowClockwise } from '@phosphor-icons/react'

type ReadingStatus = 'WANT_TO_READ' | 'READING' | 'READ' | 'ABANDONED'

const STATUS_CONFIG: Record<ReadingStatus, { label: string; className: string }> = {
  WANT_TO_READ: { label: 'Quero Ler', className: 'bg-terracotta/10 text-terracotta' },
  READING: { label: 'Lendo', className: 'bg-green-light/20 text-green-deep' },
  READ: { label: 'Lido', className: 'bg-green-deep/10 text-green-deep' },
  ABANDONED: { label: 'Abandonado', className: 'bg-brown/10 text-text-muted' },
}

export interface BookCardProps {
  title: string
  authors: string[]
  coverUrl?: string
  publisher?: string
  pageCount?: number
  colorPrimary?: string
  isInShelf?: boolean
  status?: ReadingStatus
  rating?: number | null
  rereadCount?: number
  onAdd?: () => void
  onClick?: () => void
  className?: string
}

export function BookCard({
  title,
  authors,
  coverUrl,
  publisher,
  pageCount,
  colorPrimary,
  isInShelf,
  status,
  rating,
  rereadCount,
  onAdd,
  onClick,
  className,
}: BookCardProps) {
  return (
    <div
      className={cn(
        'group border-brown/10 flex gap-4 rounded-lg border bg-white p-4 transition-all',
        'hover:border-green-deep/30 hover:shadow-md',
        onClick && 'cursor-pointer',
        className
      )}
      onClick={onClick}
    >
      {/* Cover */}
      <div
        className="relative h-32 w-20 flex-shrink-0 overflow-hidden rounded-md shadow-sm"
        style={{ backgroundColor: colorPrimary || '#e2e8f0' }}
      >
        {coverUrl ? (
          <Image
            src={coverUrl}
            alt={`Capa de ${title}`}
            fill
            className="object-cover"
            sizes="80px"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <BookOpen className="h-8 w-8 text-white/60" />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex min-w-0 flex-1 flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-text-dark line-clamp-2 font-medium">{title}</h3>
            {/* Badges */}
            <div className="flex flex-shrink-0 items-center gap-1">
              {rereadCount && rereadCount > 1 && (
                <span className="flex items-center gap-0.5 rounded-full bg-terracotta/10 px-2 py-0.5 text-xs text-terracotta">
                  <ArrowClockwise className="h-3 w-3" />
                  {rereadCount}ª
                </span>
              )}
              {status && (
                <span
                  className={cn(
                    'rounded-full px-2 py-0.5 text-xs font-medium',
                    STATUS_CONFIG[status].className
                  )}
                >
                  {STATUS_CONFIG[status].label}
                </span>
              )}
            </div>
          </div>
          {authors.length > 0 && (
            <p className="text-text-muted mt-0.5 text-sm">
              {authors.slice(0, 2).join(', ')}
              {authors.length > 2 && ` +${authors.length - 2}`}
            </p>
          )}
          {publisher && <p className="text-text-muted mt-1 text-xs">{publisher}</p>}
        </div>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {pageCount && <span className="text-text-muted text-xs">{pageCount} páginas</span>}
            {rating !== undefined && rating !== null && rating > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-amber-500">
                <Star className="h-3 w-3" weight="fill" />
                {rating.toFixed(1)}
              </span>
            )}
          </div>

          {onAdd && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onAdd()
              }}
              disabled={isInShelf}
              className={cn(
                'flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors',
                isInShelf
                  ? 'bg-green-light/20 text-green-deep'
                  : 'bg-green-deep text-cream hover:bg-green-deep/90'
              )}
            >
              {isInShelf ? (
                <>
                  <Check weight="bold" className="h-4 w-4" />
                  Na estante
                </>
              ) : (
                <>
                  <Plus weight="bold" className="h-4 w-4" />
                  Adicionar
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
