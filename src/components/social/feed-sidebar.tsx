import Link from 'next/link'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { Avatar } from '@/components/ui/avatar'
import { FollowButton } from './follow-button'
import { UserSearch } from './user-search'

export interface FriendReading {
  id: string
  currentPage: number | null
  user: { id: string; username: string | null; name: string | null; avatarUrl: string | null }
  book: { id: string; title: string; coverUrl: string | null; colorPrimary: string | null; pageCount: number | null }
}

export interface SuggestedReader {
  id: string
  username: string | null
  name: string | null
  avatarUrl: string | null
  booksCount: number
}

interface FeedSidebarProps {
  friendsReading: FriendReading[]
  suggestedReaders: SuggestedReader[]
}

export function FeedSidebar({ friendsReading, suggestedReaders }: FeedSidebarProps) {
  return (
    <div className="space-y-4">
      {friendsReading.length > 0 && (
        <section className="card p-4">
          <h2 className="section-title mb-3 text-base">Lendo agora</h2>
          <ul className="space-y-3">
            {friendsReading.map((item) => {
              const name = item.user.name || item.user.username || 'Leitor'
              const progress =
                item.book.pageCount && item.currentPage
                  ? Math.min(100, Math.round((item.currentPage / item.book.pageCount) * 100))
                  : null
              return (
                <li key={item.id} className="flex items-center gap-3">
                  <Avatar id={item.user.id} name={name} src={item.user.avatarUrl} size={28} />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/book/${item.book.id}`}
                      className="text-text-dark hover:text-green-deep block truncate text-sm font-medium"
                    >
                      {item.book.title}
                    </Link>
                    <p className="text-text-muted truncate text-xs">
                      {name.split(' ')[0]}
                      {progress !== null && ` · ${progress}%`}
                    </p>
                  </div>
                </li>
              )
            })}
          </ul>
        </section>
      )}

      {suggestedReaders.length > 0 && (
        <section className="card p-4">
          <h2 className="section-title mb-3 text-base">Leitores para seguir</h2>
          <ul className="space-y-3">
            {suggestedReaders.map((reader) => {
              const name = reader.name || reader.username || 'Leitor'
              return (
                <li key={reader.id} className="flex items-center gap-3">
                  <Link href={`/profile/${reader.username}`} className="flex min-w-0 flex-1 items-center gap-3">
                    <Avatar id={reader.id} name={name} src={reader.avatarUrl} size={32} />
                    <span className="min-w-0">
                      <span className="text-text-dark block truncate text-sm font-medium">{name}</span>
                      <span className="text-text-muted block text-xs">
                        {reader.booksCount} {reader.booksCount === 1 ? 'livro' : 'livros'}
                      </span>
                    </span>
                  </Link>
                  <FollowButton userId={reader.id} initialIsFollowing={false} variant="compact" />
                </li>
              )
            })}
          </ul>
        </section>
      )}

      <section className="card p-4">
        <h2 className="text-text-dark mb-3 flex items-center gap-2 text-sm font-medium">
          <MagnifyingGlass className="text-green-deep h-4 w-4" />
          Encontrar leitores
        </h2>
        <UserSearch />
      </section>
    </div>
  )
}
