import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Avatar } from '@/components/ui/avatar'
import { CaretLeft, User } from '@phosphor-icons/react/dist/ssr'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFollowers } from '@/lib/services/social'
import { FollowButton } from '@/components/social/follow-button'

interface FollowersPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: FollowersPageProps) {
  const { username } = await params
  return {
    title: `Seguidores de @${username}`,
  }
}

export default async function FollowersPage({ params }: FollowersPageProps) {
  const { username } = await params
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true },
  })

  if (!user) {
    notFound()
  }

  const followers = await getFollowers(user.id, session?.user?.id)

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/profile/${username}`}
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-dark"
        >
          <CaretLeft className="h-5 w-5" />
          Voltar para o perfil
        </Link>
      </div>

      <h1 className="font-fraunces mb-6 text-2xl font-bold text-text-dark">
        Seguidores de {user.name || user.username}
      </h1>

      {followers.length === 0 ? (
        <div className="card p-8 text-center">
          <User className="mx-auto h-12 w-12 text-text-muted" />
          <p className="mt-4 text-text-muted">Nenhum seguidor ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center gap-3 card p-4"
            >
              <Link href={`/profile/${follower.username}`}>
                <Avatar id={follower.id} name={follower.name || follower.username} src={follower.avatarUrl} size={48} />
              </Link>

              <div className="flex-1">
                <Link
                  href={`/profile/${follower.username}`}
                  className="font-medium text-text-dark hover:underline"
                >
                  {follower.name || follower.username}
                </Link>
                {follower.name && follower.username && (
                  <p className="text-sm text-text-muted">@{follower.username}</p>
                )}
                {follower.bio && (
                  <p className="mt-1 line-clamp-1 text-sm text-text-muted">{follower.bio}</p>
                )}
              </div>

              {session?.user?.id && session.user.id !== follower.id && (
                <FollowButton
                  userId={follower.id}
                  initialIsFollowing={follower.isFollowing}
                  variant="compact"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
