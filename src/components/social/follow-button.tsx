'use client'

import { useState } from 'react'
import { UserPlus, UserMinus } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { toggleFollow } from '@/lib/actions/social'
import { cn } from '@/lib/utils'

interface FollowButtonProps {
  userId: string
  initialIsFollowing: boolean
  variant?: 'default' | 'outline' | 'compact'
  className?: string
}

export function FollowButton({
  userId,
  initialIsFollowing,
  variant = 'default',
  className,
}: FollowButtonProps) {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing)
  const [isLoading, setIsLoading] = useState(false)

  async function handleClick() {
    setIsLoading(true)
    const result = await toggleFollow(userId)

    if (result.success) {
      setIsFollowing(result.isFollowing ?? !isFollowing)
    }

    setIsLoading(false)
  }

  if (variant === 'compact') {
    return (
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          'flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium transition-colors',
          isFollowing
            ? 'bg-cream-dark text-text-dark hover:bg-terracotta/10 hover:text-terracotta'
            : 'bg-green-deep text-white hover:bg-green-deep/90',
          className
        )}
      >
        {isFollowing ? (
          <>
            <UserMinus className="h-4 w-4" />
            <span className="hidden sm:inline">Seguindo</span>
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4" />
            <span className="hidden sm:inline">Seguir</span>
          </>
        )}
      </button>
    )
  }

  return (
    <Button
      onClick={handleClick}
      isLoading={isLoading}
      variant={isFollowing ? 'secondary' : 'primary'}
      className={cn(
        isFollowing && 'hover:border-red-500 hover:text-red-500',
        className
      )}
    >
      {isFollowing ? (
        <>
          <UserMinus className="mr-2 h-4 w-4" />
          Seguindo
        </>
      ) : (
        <>
          <UserPlus className="mr-2 h-4 w-4" />
          Seguir
        </>
      )}
    </Button>
  )
}
