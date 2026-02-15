'use client'

import { useState } from 'react'
import { Star } from '@phosphor-icons/react'
import { updateUserBook } from '@/lib/actions/book'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
  userBookId: string
  currentRating: number | null
  readonly?: boolean
}

export function RatingStars({ userBookId, currentRating, readonly }: RatingStarsProps) {
  const [rating, setRating] = useState<number | null>(currentRating)
  const [hoverRating, setHoverRating] = useState<number | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)

  const displayRating = hoverRating ?? rating ?? 0

  async function handleClick(newRating: number) {
    if (readonly || isUpdating) return

    // Toggle off if clicking the same rating
    const finalRating = newRating === rating ? null : newRating

    setIsUpdating(true)
    const result = await updateUserBook({ userBookId, rating: finalRating })

    if (result.success) {
      setRating(finalRating)
    }

    setIsUpdating(false)
  }

  function handleMouseMove(starIndex: number, event: React.MouseEvent<HTMLButtonElement>) {
    if (readonly) return

    const rect = event.currentTarget.getBoundingClientRect()
    const x = event.clientX - rect.left
    const isLeftHalf = x < rect.width / 2

    // Calculate rating: left half = .5, right half = full star
    const newRating = starIndex + (isLeftHalf ? 0.5 : 1)
    setHoverRating(newRating)
  }

  return (
    <div
      className={cn('flex items-center gap-0.5', isUpdating && 'opacity-50')}
      onMouseLeave={() => setHoverRating(null)}
    >
      {[0, 1, 2, 3, 4].map((starIndex) => {
        const fillAmount = Math.max(0, Math.min(1, displayRating - starIndex))

        return (
          <button
            key={starIndex}
            onClick={() => handleClick(hoverRating || starIndex + 1)}
            onMouseMove={(e) => handleMouseMove(starIndex, e)}
            disabled={readonly || isUpdating}
            className={cn(
              'relative h-6 w-6 text-amber-400 transition-transform',
              !readonly && 'hover:scale-110',
              readonly && 'cursor-default'
            )}
            aria-label={`${starIndex + 1} estrelas`}
          >
            {/* Empty star (background) */}
            <Star className="absolute inset-0 h-6 w-6" weight="regular" />

            {/* Filled star with clip */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ width: `${fillAmount * 100}%` }}
            >
              <Star className="h-6 w-6" weight="fill" />
            </div>
          </button>
        )
      })}

      {rating && <span className="text-text-muted ml-2 text-sm">{rating.toFixed(1)}</span>}
    </div>
  )
}
