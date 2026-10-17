'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  Heart,
  ChatCircle,
  ShareNetwork,
  Check,
  Star,
  StarHalf,
  BookOpen,
  CheckCircle,
  XCircle,
  Quotes,
} from '@phosphor-icons/react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import type { FeedPostData } from '@/lib/services/feed'
import { toggleLike } from '@/lib/actions/social'
import { cn } from '@/lib/utils'
import { CommentSection } from './comment-section'
import { Avatar } from '@/components/ui/avatar'
import { ShareCardModal } from '@/components/book/share-card-modal'
import { shareOrCopy } from '@/lib/share'

interface FeedPostCardProps {
  post: FeedPostData
  showComments?: boolean
  currentUserId?: string
}

const POST_TYPE_CONFIG = {
  STARTED: {
    icon: BookOpen,
    text: 'começou a ler',
    color: 'text-green-light',
    bgColor: 'bg-green-light/10',
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

export function FeedPostCard({ post, showComments = false, currentUserId }: FeedPostCardProps) {
  const [isLiked, setIsLiked] = useState(post.isLiked)
  const [likesCount, setLikesCount] = useState(post.likesCount)
  const [isLiking, setIsLiking] = useState(false)
  const [showCommentsSection, setShowCommentsSection] = useState(showComments)
  const [showShareCard, setShowShareCard] = useState(false)
  const [shareFeedback, setShareFeedback] = useState<string | null>(null)

  const config = POST_TYPE_CONFIG[post.type]
  const Icon = config.icon
  // começar/abandonar viram uma linha só; terminar, avaliar e citar ganham destaque
  const isCompact = (post.type === 'STARTED' || post.type === 'ABANDONED') && !post.content
  const userName = post.user.name || post.user.username || 'Leitor'
  const timeAgo = formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: ptBR })

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

  // o próprio post de leitura terminada vira o card de imagem; o resto compartilha o link do perfil
  const canMakeCard =
    !!post.book &&
    post.user.id === currentUserId &&
    (post.type === 'FINISHED' || post.type === 'REVIEW')

  async function handleShare() {
    if (canMakeCard) {
      setShowShareCard(true)
      return
    }
    const url = `${window.location.origin}/profile/${post.user.username}`
    const text = post.book
      ? `${userName} ${config.text} ${post.book.title} no Traça`
      : `${userName} no Traça`
    const outcome = await shareOrCopy({ title: 'Traça', text, url })
    if (outcome === 'copied') setShareFeedback('Link copiado')
    else if (outcome === 'failed') setShareFeedback('Não deu para copiar o link')
    if (outcome === 'copied' || outcome === 'failed') setTimeout(() => setShareFeedback(null), 2000)
  }

  const actions = (
    <div className="flex items-center gap-0.5">
      <button
        onClick={handleLike}
        disabled={isLiking}
        aria-pressed={isLiked}
        aria-label={isLiked ? 'Descurtir' : 'Curtir'}
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
          isLiked ? 'text-terracotta' : 'text-text-muted hover:bg-cream-dark hover:text-terracotta'
        )}
      >
        <Heart className="h-[18px] w-[18px]" weight={isLiked ? 'fill' : 'regular'} />
        {likesCount > 0 && <span className="tabular-nums">{likesCount}</span>}
      </button>
      <button
        onClick={() => setShowCommentsSection(!showCommentsSection)}
        aria-expanded={showCommentsSection}
        aria-label="Comentários"
        className={cn(
          'flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors',
          showCommentsSection
            ? 'text-green-deep'
            : 'text-text-muted hover:bg-cream-dark hover:text-green-deep'
        )}
      >
        <ChatCircle
          className="h-[18px] w-[18px]"
          weight={showCommentsSection ? 'fill' : 'regular'}
        />
        {post.commentsCount > 0 && <span className="tabular-nums">{post.commentsCount}</span>}
      </button>
      <button
        onClick={handleShare}
        aria-label={canMakeCard ? 'Gerar imagem para compartilhar' : 'Compartilhar'}
        className="text-text-muted hover:bg-cream-dark hover:text-green-deep flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm transition-colors"
      >
        {shareFeedback === 'Link copiado' ? (
          <Check className="text-green-deep h-[18px] w-[18px]" weight="bold" />
        ) : (
          <ShareNetwork className="h-[18px] w-[18px]" />
        )}
      </button>
      <span role="status" aria-live="polite" className="text-text-muted text-xs">
        {shareFeedback}
      </span>
    </div>
  )

  if (isCompact) {
    return (
      <article className="card px-4 py-3">
        <div className="flex items-center gap-3">
          <Link href={`/profile/${post.user.username}`} className="shrink-0">
            <Avatar id={post.user.id} name={userName} src={post.user.avatarUrl} size={32} />
          </Link>
          <p className="text-text-dark min-w-0 flex-1 text-sm leading-snug">
            <Link
              href={`/profile/${post.user.username}`}
              className="hover:text-green-deep font-semibold"
            >
              {userName}
            </Link>{' '}
            <span className={config.color}>
              <Icon className="mr-0.5 inline h-3.5 w-3.5 -translate-y-px" weight="fill" />
              {config.text}
            </span>{' '}
            {post.book && (
              <Link href={`/book/${post.book.id}`} className="hover:text-green-deep font-semibold">
                {post.book.title}
              </Link>
            )}
            <span className="text-text-muted"> · {timeAgo}</span>
          </p>
          {post.book && <BookThumb book={post.book} className="h-12 w-8" />}
          <div className="hidden sm:block">{actions}</div>
        </div>
        <div className="mt-1 -mb-1 ml-9 sm:hidden">{actions}</div>
        {showCommentsSection && <CommentSection postId={post.id} currentUserId={currentUserId} />}
        {showShareCard && post.book && (
          <ShareCardModal
            isOpen
            onClose={() => setShowShareCard(false)}
            book={post.book}
            rating={post.rating}
            username={post.user.username}
          />
        )}
      </article>
    )
  }

  return (
    <article className="card p-5">
      {/* Cabeçalho */}
      <div className="flex items-start gap-3">
        <Link href={`/profile/${post.user.username}`} className="shrink-0">
          <Avatar id={post.user.id} name={userName} src={post.user.avatarUrl} size={40} />
        </Link>
        <div className="min-w-0 flex-1">
          <p className="text-text-dark text-sm leading-snug">
            <Link
              href={`/profile/${post.user.username}`}
              className="hover:text-green-deep font-semibold"
            >
              {userName}
            </Link>{' '}
            <span className={config.color}>
              <Icon className="mr-0.5 inline h-3.5 w-3.5 -translate-y-px" weight="fill" />
              {config.text}
            </span>
          </p>
          <p className="text-text-muted mt-0.5 text-xs">{timeAgo}</p>
        </div>
      </div>

      {/* Livro */}
      {post.book && (
        <Link
          href={`/book/${post.book.id}`}
          className="bg-cream hover:bg-cream-dark mt-4 flex gap-4 rounded-xl p-3 transition-colors"
        >
          <BookThumb book={post.book} className="h-24 w-16" />
          <div className="min-w-0 self-center">
            <p className="font-fraunces text-text-dark line-clamp-2 text-lg leading-snug font-semibold">
              {post.book.title}
            </p>
            <p className="text-text-muted truncate text-sm">{post.book.authors.join(', ')}</p>
            {post.rating && (post.type === 'FINISHED' || post.type === 'REVIEW') && (
              <div
                className="mt-1.5 flex items-center gap-0.5"
                aria-label={`Nota ${post.rating} de 5`}
              >
                {Array.from({ length: 5 }).map((_, i) => {
                  const fill = post.rating! - i
                  const StarIcon = fill >= 1 ? Star : fill >= 0.5 ? StarHalf : Star
                  return (
                    <StarIcon
                      key={i}
                      weight={fill >= 0.5 ? 'fill' : 'regular'}
                      className={cn(
                        'h-4 w-4',
                        fill >= 0.5 ? 'text-terracotta' : 'text-text-muted/40'
                      )}
                    />
                  )
                })}
                <span className="text-text-muted ml-1.5 text-xs font-medium tabular-nums">
                  {post.rating.toLocaleString('pt-BR')}
                </span>
              </div>
            )}
          </div>
        </Link>
      )}

      {/* Texto (resenha / citação) */}
      {post.content && (
        <div className="mt-4">
          {post.type === 'QUOTE_SHARED' ? (
            <blockquote className="border-terracotta/50 font-fraunces text-text-dark border-l-2 pl-4 text-lg italic">
              &ldquo;{post.content}&rdquo;
            </blockquote>
          ) : (
            <p className="text-text-dark leading-relaxed">{post.content}</p>
          )}
        </div>
      )}

      <div className="mt-3 -ml-2.5">{actions}</div>

      {showCommentsSection && <CommentSection postId={post.id} currentUserId={currentUserId} />}
      {showShareCard && post.book && (
        <ShareCardModal
          isOpen
          onClose={() => setShowShareCard(false)}
          book={post.book}
          rating={post.rating}
          username={post.user.username}
        />
      )}
    </article>
  )
}

function BookThumb({
  book,
  className,
}: {
  book: NonNullable<FeedPostData['book']>
  className?: string
}) {
  return (
    <span
      className={cn(
        'relative block shrink-0 overflow-hidden rounded-[3px] shadow-[0_4px_10px_-4px_rgb(0_0_0/0.4)]',
        className
      )}
      style={{ backgroundColor: book.colorPrimary || 'var(--cream-dark)' }}
    >
      {book.coverUrl ? (
        <Image src={book.coverUrl} alt="" fill sizes="64px" className="object-cover" />
      ) : (
        <BookOpen className="text-on-brand/70 absolute inset-0 m-auto h-4 w-4" />
      )}
    </span>
  )
}
