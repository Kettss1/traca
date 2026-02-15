'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { MagnifyingGlass, Books } from '@phosphor-icons/react'
import { Input } from '@/components/ui/input'
import { FollowButton } from './follow-button'
import { searchUsersAction } from '@/lib/actions/social'
import { useDebounce } from '@/hooks/use-debounce'

interface SearchResult {
  id: string
  username: string | null
  name: string | null
  avatarUrl: string | null
  bio: string | null
  booksRead: number
  isFollowing: boolean
}

export function UserSearch() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const debouncedQuery = useDebounce(query, 300)

  const performSearch = useCallback(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([])
      return
    }

    setIsSearching(true)
    try {
      const users = await searchUsersAction(searchQuery)
      setResults(users)
    } catch (error) {
      console.error('Error searching users:', error)
    } finally {
      setIsSearching(false)
    }
  }, [])

  useEffect(() => {
    performSearch(debouncedQuery)
  }, [debouncedQuery, performSearch])

  return (
    <div className="space-y-3">
      <div className="relative">
        <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar usuários..."
          className="pl-9 text-sm"
        />
      </div>

      {isSearching && (
        <p className="py-2 text-center text-xs text-text-muted">Buscando...</p>
      )}

      {!isSearching && query && results.length === 0 && (
        <p className="py-2 text-center text-xs text-text-muted">
          Nenhum usuário encontrado
        </p>
      )}

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-2.5 rounded-xl bg-cream-dark/30 p-2.5"
            >
              <Link href={`/profile/${user.username}`} className="shrink-0">
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || user.username || 'Avatar'}
                    width={36}
                    height={36}
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-deep/10 text-sm font-medium text-green-deep">
                    {(user.name || user.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="min-w-0 flex-1">
                <Link
                  href={`/profile/${user.username}`}
                  className="block truncate text-sm font-medium text-text-dark hover:text-green-deep"
                >
                  {user.name || user.username}
                </Link>
                <div className="flex items-center gap-1 text-[11px] text-text-muted">
                  <Books className="h-3 w-3" />
                  <span>{user.booksRead} lidos</span>
                </div>
              </div>

              <FollowButton
                userId={user.id}
                initialIsFollowing={user.isFollowing}
                variant="compact"
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
