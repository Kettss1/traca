'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { BookOpen, Globe, Books } from '@phosphor-icons/react'
import { FeedPostCard } from './feed-post-card'
import { FeedSidebar, type FriendReading, type SuggestedReader } from './feed-sidebar'
import { Spinner } from '@/components/ui/spinner'
import type { FeedPostData } from '@/lib/services/feed'
import { cn } from '@/lib/utils'

interface FeedContentProps {
  initialPosts: FeedPostData[]
  userId: string
  friendsReading: FriendReading[]
  suggestedReaders: SuggestedReader[]
}

type FeedType = 'home' | 'global'

export function FeedContent({ initialPosts, userId, friendsReading, suggestedReaders }: FeedContentProps) {
  const [posts, setPosts] = useState<FeedPostData[]>(initialPosts)
  const [feedType, setFeedType] = useState<FeedType>('home')
  const [cursor, setCursor] = useState<string | null>(null)
  const [hasMore, setHasMore] = useState(true)
  const [isLoading, setIsLoading] = useState(false)

  const { ref, inView } = useInView({
    threshold: 0,
    rootMargin: '100px',
  })

  const loadMorePosts = useCallback(async () => {
    if (isLoading || !hasMore) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `/api/feed?type=${feedType}&cursor=${cursor || ''}`
      )
      const data = await response.json()

      if (data.posts.length > 0) {
        setPosts((prev) => [...prev, ...data.posts])
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      } else {
        setHasMore(false)
      }
    } catch (error) {
      console.error('Error loading more posts:', error)
    } finally {
      setIsLoading(false)
    }
  }, [feedType, cursor, isLoading, hasMore])

  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      loadMorePosts()
    }
  }, [inView, hasMore, isLoading, loadMorePosts])

  const isFirstRender = useRef(true)

  useEffect(() => {
    // Skip fetch on initial mount — we already have initialPosts for 'home'
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    async function loadFeed() {
      setIsLoading(true)
      setPosts([])
      setCursor(null)
      setHasMore(true)

      try {
        const response = await fetch(`/api/feed?type=${feedType}`)
        const data = await response.json()
        setPosts(data.posts)
        setCursor(data.nextCursor)
        setHasMore(!!data.nextCursor)
      } catch (error) {
        console.error('Error loading feed:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFeed()
  }, [feedType])

  return (
    <div className="mx-auto max-w-3xl">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-fraunces text-2xl font-bold text-text-dark">Feed</h1>
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 rounded-xl bg-cream-dark/60 p-1">
        <button
          onClick={() => setFeedType('home')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            feedType === 'home'
              ? 'bg-surface text-green-deep shadow-sm'
              : 'text-text-muted hover:text-text-dark'
          )}
        >
          <BookOpen className="h-4 w-4" weight={feedType === 'home' ? 'fill' : 'regular'} />
          Seguindo
        </button>
        <button
          onClick={() => setFeedType('global')}
          className={cn(
            'flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all',
            feedType === 'global'
              ? 'bg-surface text-green-deep shadow-sm'
              : 'text-text-muted hover:text-text-dark'
          )}
        >
          <Globe className="h-4 w-4" weight={feedType === 'global' ? 'fill' : 'regular'} />
          Descobrir
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        {/* Main feed */}
        <div className="space-y-4">
          {posts.length === 0 && !isLoading ? (
            <EmptyFeed feedType={feedType} />
          ) : (
            <div className="space-y-3">
              {posts.map((post) => (
                <FeedPostCard key={post.id} post={post} currentUserId={userId} />
              ))}
            </div>
          )}

          {/* Load more trigger */}
          <div ref={ref} className="h-10">
            {isLoading && (
              <div className="flex justify-center py-6">
                <Spinner size="lg" className="text-green-deep" />
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="hidden lg:block">
          <div className="sticky top-20">
            <FeedSidebar friendsReading={friendsReading} suggestedReaders={suggestedReaders} />
          </div>
        </div>
      </div>
    </div>
  )
}

function EmptyFeed({ feedType }: { feedType: FeedType }) {
  return (
    <div className="card px-6 py-12 text-center">
      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-cream-dark/60">
        <Books className="h-8 w-8 text-text-muted" />
      </div>
      {feedType === 'home' ? (
        <>
          <p className="font-medium text-text-dark">Seu feed está vazio</p>
          <p className="mt-1 text-sm text-text-muted">
            Siga outros leitores para acompanhar suas leituras
          </p>
        </>
      ) : (
        <>
          <p className="font-medium text-text-dark">Nenhuma atividade recente</p>
          <p className="mt-1 text-sm text-text-muted">
            Volte mais tarde para descobrir o que a comunidade está lendo
          </p>
        </>
      )}
    </div>
  )
}
