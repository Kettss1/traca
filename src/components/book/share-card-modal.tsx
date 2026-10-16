'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  X,
  DownloadSimple,
  ShareNetwork,
  Check,
  Confetti,
  Image as ImageIcon,
} from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface ShareCardModalProps {
  isOpen: boolean
  onClose: () => void
  book: {
    title: string
    authors: string[]
    coverUrl?: string | null
    colorPrimary?: string | null
    colorSecondary?: string | null
  }
  rating?: number | null
  username?: string | null
}

type CardFormat = 'story' | 'feed'

export function ShareCardModal({
  isOpen,
  onClose,
  book,
  rating,
  username,
}: ShareCardModalProps) {
  const [format, setFormat] = useState<CardFormat>('story')
  const [isDownloading, setIsDownloading] = useState(false)
  const [downloadSuccess, setDownloadSuccess] = useState(false)

  // Build the share card URL
  const shareCardUrl = new URL('/api/share-card', window.location.origin)
  shareCardUrl.searchParams.set('title', book.title)
  shareCardUrl.searchParams.set('author', book.authors.join(', '))
  if (book.coverUrl) shareCardUrl.searchParams.set('cover', book.coverUrl)
  if (rating) shareCardUrl.searchParams.set('rating', rating.toString())
  if (book.colorPrimary) shareCardUrl.searchParams.set('color1', book.colorPrimary)
  if (book.colorSecondary) shareCardUrl.searchParams.set('color2', book.colorSecondary)
  if (username) shareCardUrl.searchParams.set('user', username)
  shareCardUrl.searchParams.set('format', format)

  const handleDownload = async () => {
    setIsDownloading(true)
    try {
      const response = await fetch(shareCardUrl.toString())
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `lertraca-${book.title.toLowerCase().replace(/\s+/g, '-')}-${format}.png`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      setDownloadSuccess(true)
      setTimeout(() => setDownloadSuccess(false), 2000)
    } catch (error) {
      console.error('Error downloading card:', error)
    } finally {
      setIsDownloading(false)
    }
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        const response = await fetch(shareCardUrl.toString())
        const blob = await response.blob()
        const file = new File([blob], `lertraca-${book.title}.png`, { type: 'image/png' })

        await navigator.share({
          title: `Acabei de ler: ${book.title}`,
          text: `Acabei de ler "${book.title}" de ${book.authors.join(', ')}! 📚`,
          files: [file],
        })
      } catch (error) {
        // User cancelled or error
        console.error('Error sharing:', error)
      }
    }
  }

  const canShare = typeof navigator !== 'undefined' && 'share' in navigator

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
            className="fixed inset-4 z-50 m-auto flex max-h-[90vh] max-w-xl flex-col overflow-hidden rounded-2xl bg-cream shadow-2xl"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line p-6">
              <div className="flex items-center gap-3">
                <Confetti className="h-8 w-8 text-terracotta" weight="fill" />
                <div>
                  <h2 className="font-fraunces text-xl font-bold text-text-dark">
                    Parabéns!
                  </h2>
                  <p className="text-sm text-text-muted">Você terminou de ler este livro!</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-text-muted transition-colors hover:bg-cream-dark hover:text-text-dark"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <p className="mb-4 text-center text-sm text-text-muted">
                Compartilhe sua conquista com um card personalizado!
              </p>

              {/* Format selector */}
              <div className="mb-4 flex justify-center gap-2">
                <button
                  onClick={() => setFormat('story')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    format === 'story'
                      ? 'bg-green-deep text-on-brand'
                      : 'bg-surface text-text-dark hover:bg-cream-dark'
                  )}
                >
                  <ImageIcon className="h-4 w-4" />
                  Story (9:16)
                </button>
                <button
                  onClick={() => setFormat('feed')}
                  className={cn(
                    'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors',
                    format === 'feed'
                      ? 'bg-green-deep text-on-brand'
                      : 'bg-surface text-text-dark hover:bg-cream-dark'
                  )}
                >
                  <ImageIcon className="h-4 w-4" />
                  Feed (1:1)
                </button>
              </div>

              {/* Preview image */}
              <div className="flex justify-center">
                <div
                  className={cn(
                    'overflow-hidden rounded-lg shadow-lg',
                    format === 'story' ? 'aspect-[9/16] w-48' : 'aspect-square w-64'
                  )}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={shareCardUrl.toString()}
                    alt="Share card preview"
                    className="h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-line p-6">
              <button
                onClick={handleDownload}
                disabled={isDownloading}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors',
                  downloadSuccess
                    ? 'bg-green-deep text-on-brand'
                    : 'bg-green-deep text-on-brand hover:bg-green-deep/90'
                )}
              >
                {downloadSuccess ? (
                  <>
                    <Check className="h-5 w-5" />
                    Baixado!
                  </>
                ) : isDownloading ? (
                  'Gerando...'
                ) : (
                  <>
                    <DownloadSimple className="h-5 w-5" />
                    Baixar Imagem
                  </>
                )}
              </button>

              {canShare && (
                <button
                  onClick={handleShare}
                  className="flex items-center justify-center gap-2 rounded-lg bg-terracotta px-4 py-3 font-medium text-on-brand transition-colors hover:bg-terracotta/90"
                >
                  <ShareNetwork className="h-5 w-5" />
                  Compartilhar
                </button>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
