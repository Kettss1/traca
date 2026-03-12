'use client'

import { useState } from 'react'
import { BookOpen, BookmarkSimple, CheckCircle, X } from '@phosphor-icons/react'
import { track } from '@vercel/analytics'
import { updateUserBook } from '@/lib/actions/book'
import { cn } from '@/lib/utils'
import type { ReadingStatus } from '@/lib/validators/book'
import { ShareCardModal } from './share-card-modal'

const statusConfig: {
  key: ReadingStatus
  label: string
  icon: typeof BookOpen
  bg: string
  activeBg: string
  text: string
}[] = [
  {
    key: 'WANT_TO_READ',
    label: 'Quero Ler',
    icon: BookmarkSimple,
    bg: 'bg-terracotta/5',
    activeBg: 'bg-terracotta/15 ring-1 ring-terracotta/30',
    text: 'text-terracotta',
  },
  {
    key: 'READING',
    label: 'Lendo',
    icon: BookOpen,
    bg: 'bg-green-light/5',
    activeBg: 'bg-green-light/15 ring-1 ring-green-light/30',
    text: 'text-green-deep',
  },
  {
    key: 'READ',
    label: 'Lido',
    icon: CheckCircle,
    bg: 'bg-green-deep/5',
    activeBg: 'bg-green-deep/15 ring-1 ring-green-deep/30',
    text: 'text-green-deep',
  },
  {
    key: 'ABANDONED',
    label: 'Abandonado',
    icon: X,
    bg: 'bg-brown/5',
    activeBg: 'bg-brown/15 ring-1 ring-brown/30',
    text: 'text-brown',
  },
]

interface StatusSelectorProps {
  userBookId: string
  currentStatus: ReadingStatus
  book?: {
    title: string
    authors: string[]
    coverUrl?: string | null
    colorPrimary?: string | null
    colorSecondary?: string | null
  }
  rating?: number | null
  username?: string | null
}

export function StatusSelector({
  userBookId,
  currentStatus,
  book,
  rating,
  username,
}: StatusSelectorProps) {
  const [status, setStatus] = useState<ReadingStatus>(currentStatus)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  async function handleSelect(newStatus: ReadingStatus) {
    if (newStatus === status || isUpdating) return

    setIsUpdating(true)
    const result = await updateUserBook({ userBookId, status: newStatus })

    if (result.success) {
      track('book_status_changed', { from: status, to: newStatus })
      setStatus(newStatus)
      if (newStatus === 'READ' && book) {
        setShowShareModal(true)
      }
    }

    setIsUpdating(false)
  }

  return (
    <>
      <div className={cn('grid grid-cols-2 gap-2', isUpdating && 'pointer-events-none opacity-60')}>
        {statusConfig.map(({ key, label, icon: Icon, bg, activeBg, text }) => {
          const isActive = key === status
          return (
            <button
              key={key}
              onClick={() => handleSelect(key)}
              className={cn(
                'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                isActive ? cn(activeBg, text) : cn(bg, 'text-text-muted hover:text-text-dark'),
              )}
            >
              <Icon className="h-4.5 w-4.5 shrink-0" weight={isActive ? 'fill' : 'regular'} />
              {label}
            </button>
          )
        })}
      </div>

      {/* Share Card Modal */}
      {book && (
        <ShareCardModal
          isOpen={showShareModal}
          onClose={() => setShowShareModal(false)}
          book={book}
          rating={rating}
          username={username}
        />
      )}
    </>
  )
}
