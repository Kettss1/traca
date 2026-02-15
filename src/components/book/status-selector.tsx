'use client'

import { useState } from 'react'
import { BookOpen, BookmarkSimple, Check, X } from '@phosphor-icons/react'
import { updateUserBook } from '@/lib/actions/book'
import { cn } from '@/lib/utils'
import type { ReadingStatus } from '@/lib/validators/book'
import { ShareCardModal } from './share-card-modal'

const statusConfig: Record<ReadingStatus, { label: string; icon: typeof BookOpen; color: string }> =
  {
    WANT_TO_READ: {
      label: 'Quero Ler',
      icon: BookmarkSimple,
      color: 'text-terracotta',
    },
    READING: {
      label: 'Lendo',
      icon: BookOpen,
      color: 'text-green-deep',
    },
    READ: {
      label: 'Lido',
      icon: Check,
      color: 'text-green-deep',
    },
    ABANDONED: {
      label: 'Abandonado',
      icon: X,
      color: 'text-text-muted',
    },
  }

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
  const [isOpen, setIsOpen] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [showShareModal, setShowShareModal] = useState(false)

  const currentConfig = statusConfig[status]
  const Icon = currentConfig.icon

  async function handleSelect(newStatus: ReadingStatus) {
    if (newStatus === status) {
      setIsOpen(false)
      return
    }

    setIsUpdating(true)
    const result = await updateUserBook({ userBookId, status: newStatus })

    if (result.success) {
      setStatus(newStatus)
      // Show share modal when marking as READ
      if (newStatus === 'READ' && book) {
        setShowShareModal(true)
      }
    }

    setIsUpdating(false)
    setIsOpen(false)
  }

  return (
    <>
      <div className="relative">
        <button
          onClick={() => setIsOpen(!isOpen)}
          disabled={isUpdating}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
            'border-brown/20 hover:border-green-deep/30 border',
            currentConfig.color,
            isUpdating && 'opacity-50'
          )}
        >
          <Icon className="h-4 w-4" weight="fill" />
          {currentConfig.label}
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="border-brown/10 absolute top-full right-0 z-20 mt-2 w-40 rounded-lg border bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              {(Object.keys(statusConfig) as ReadingStatus[]).map((key) => {
                const config = statusConfig[key]
                const StatusIcon = config.icon
                return (
                  <button
                    key={key}
                    onClick={() => handleSelect(key)}
                    className={cn(
                      'flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors',
                      'hover:bg-cream-dark dark:hover:bg-gray-700',
                      key === status ? config.color : 'text-text-muted'
                    )}
                  >
                    <StatusIcon className="h-4 w-4" weight={key === status ? 'fill' : 'regular'} />
                    {config.label}
                  </button>
                )
              })}
            </div>
          </>
        )}
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
