import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
          className="inline-flex items-center gap-2 text-text-muted hover:text-text-dark dark:hover:text-white"
        >
          <CaretLeft className="h-5 w-5" />
          Voltar para o perfil
        </Link>
      </div>

      <h1 className="font-fraunces mb-6 text-2xl font-bold text-text-dark dark:text-white">
        Seguidores de {user.name || user.username}
      </h1>

      {followers.length === 0 ? (
        <div className="rounded-lg bg-white p-8 text-center shadow-sm dark:bg-gray-800">
          <User className="mx-auto h-12 w-12 text-text-muted" />
          <p className="mt-4 text-text-muted">Nenhum seguidor ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {followers.map((follower) => (
            <div
              key={follower.id}
              className="flex items-center gap-3 rounded-lg bg-white p-4 shadow-sm dark:bg-gray-800"
            >
              <Link href={`/profile/${follower.username}`}>
                {follower.avatarUrl ? (
                  <Image
                    src={follower.avatarUrl}
                    alt={follower.name || follower.username || 'Avatar'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-light/20 text-lg text-green-deep">
                    {(follower.name || follower.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="flex-1">
                <Link
                  href={`/profile/${follower.username}`}
                  className="font-medium text-text-dark hover:underline dark:text-white"
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
