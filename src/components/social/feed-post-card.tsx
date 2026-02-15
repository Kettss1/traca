'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, ChatCircle, ShareNetwork, Star, BookOpen, CheckCircle, XCircle, Quotes } from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FeedPostData } from '@/lib/services/feed'
import { toggleLike } from '@/lib/actions/social'
import { cn } from '@/lib/utils'
import { CommentSection } from './comment-section'

interface FeedPostCardProps {
  post: FeedPostData
  showComments?: boolean
}

const POST_TYPE_CONFIG = {
  STARTED: {
    icon: BookOpen,
    text: 'começou a ler',
    color: 'text-green-accent',
    bgColor: 'bg-green-accent/10',
  },
  FINISHED: {
    icon: CheckCircle,
    text: 'terminou de ler',
    color: 'text-green-deep',
    bgColor: 'bg-green-deep/10',
  },
  ABANDONED: {
    icon: XCircle,
    text: 'abandonou',
    color: 'text-text-muted',
    bgColor: 'bg-cream-dark/50',
  },
  REVIEW: {
    icon: Star,
    text: 'avaliou',
    color: 'text-terracotta',
    bgColor: 'bg-terracotta/10',
  },
  QUOTE_SHARED: {
    icon: Quotes,
    text: 'compartilhou uma citação de',
    color: 'text-brown',
    bgColor: 'bg-brown/10',
  },
}

export function FeedPostCard({ post, showComments = false }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [isLiking, setIsLiking] = useState(false)
  const [showCommentsSection, setShowCommentsSection] = useState(showComments)

  const config = POST_TYPE_CONFIG[post.type]
  const Icon = config.icon

  async function handleLike() {
    setIsLiking(true)
    const previousState = isLiked

    setIsLiked(!isLiked)
    setLikesCount((c) => (isLiked ? c - 1 : c + 1))

    const result = await toggleLike(post.id)

    if (!result.success) {
      setIsLiked(previousState)
      setLikesCount((c) => (previousState ? c + 1 : c - 1))
    }

    setIsLiking(false)
  }

  return (
    <article className="rounded-2xl border border-cream-dark/80 bg-cream-dark/20 p-5">
      {/* Header */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.user.username}`} className="shrink-0">
          {post.user.avatarUrl ? (
            <Image
              src={post.user.avatarUrl}
              alt={post.user.name || post.user.username || 'Avatar'}
              width={40}
              height={40}
              className="h-10 w-10 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-deep/10 font-medium text-green-deep">
              {(post.user.name || post.user.username || 'U')[0].toUpperCase()}
            </div>
          )}
        </Link>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-baseline gap-x-1.5 text-sm leading-snug">
            <Link
              href={`/profile/${post.user.username}`}
              className="font-semibold text-text-dark hover:text-green-deep"
            >
              {post.user.name || post.user.username}
            </Link>
            <span className={cn('flex items-center gap-1', config.color)}>
              {config.text}
            </span>
            {post.book && (
              <Link
                href={`/book/${post.book.id}`}
                className="font-semibold text-text-dark hover:text-green-deep"
              >
                {post.book.title}
              </Link>
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">
            {formatDistanceToNow(new Date(post.createdAt), {
              addSuffix: true,
              locale: ptBR,
            })}
          </p>
        </div>

        {/* Type badge */}
        <div className={cn('shrink-0 rounded-full p-2', config.bgColor)}>
          <Icon className={cn('h-4 w-4', config.color)} weight="fill" />
        </div>
      </div>

      {/* Book info */}
      {post.book && (
        <Link
          href={`/book/${post.book.id}`}
          className="mt-4 flex gap-3 rounded-xl border border-cream-dark/60 bg-cream/80 p-3 transition-colors hover:bg-cream"
        >
          {post.book.coverUrl ? (
            <Image
              src={post.book.coverUrl}
              alt={post.book.title}
              width={48}
              height={72}
              className="h-[72px] w-12 shrink-0 rounded-md object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-[72px] w-12 shrink-0 items-center justify-center rounded-md bg-cream-dark">
              <BookOpen className="h-5 w-5 text-text-muted" />
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate font-medium text-text-dark">{post.book.title}</p>
            <p className="truncate text-sm text-text-muted">{post.book.authors.join(', ')}</p>
            {post.rating && (
              <div className="mt-1.5 flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    weight={i < Math.floor(post.rating!) ? 'fill' : 'regular'}
                    className={cn(
                      'h-3.5 w-3.5',
                      i < Math.floor(post.rating!) ? 'text-terracotta' : 'text-cream-dark'
                    )}
                  />
                ))}
                <span className="ml-1.5 text-xs font-medium text-text-muted">{post.rating}</span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Content (quotes/reviews) */}
      {post.content && (
        <div className="mt-4">
          {post.type === 'QUOTE_SHARED' ? (
            <blockquote className="rounded-xl border-l-3 border-brown/40 bg-cream/60 py-3 pr-4 pl-4 italic text-text-dark">
              &ldquo;{post.content}&rdquo;
            </blockquote>
          ) : (
            <p className="text-sm leading-relaxed text-text-dark">{post.content}</p>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="mt-4 flex items-center gap-1 border-t border-cream-dark/60 pt-3">
        <button
          onClick={handleLike}
          disabled={isLiking}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
            isLiked
              ? 'text-terracotta'
              : 'text-text-muted hover:bg-cream-dark/40 hover:text-terracotta'
          )}
        >
          <Heart className="h-[18px] w-[18px]" weight={isLiked ? 'fill' : 'regular'} />
          {likesCount > 0 && <span>{likesCount}</span>}
        </button>

        <button
          onClick={() => setShowCommentsSection(!showCommentsSection)}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
            showCommentsSection
              ? 'text-green-deep'
              : 'text-text-muted hover:bg-cream-dark/40 hover:text-green-deep'
          )}
        >
          <ChatCircle className="h-[18px] w-[18px]" weight={showCommentsSection ? 'fill' : 'regular'} />
          {post.commentsCount > 0 && <span>{post.commentsCount}</span>}
        </button>

        <button className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-text-muted transition-colors hover:bg-cream-dark/40 hover:text-green-deep">
          <ShareNetwork className="h-[18px] w-[18px]" />
        </button>
      </div>

      {/* Comments */}
      {showCommentsSection && <CommentSection postId={post.id} />}
    </article>
  )
}
