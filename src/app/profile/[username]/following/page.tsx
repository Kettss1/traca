import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { CaretLeft, User } from '@phosphor-icons/react/dist/ssr'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getFollowing } from '@/lib/services/social'
import { FollowButton } from '@/components/social/follow-button'

interface FollowingPageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: FollowingPageProps) {
  const { username } = await params
  return {
    title: `Seguindo de @${username}`,
  }
}

export default async function FollowingPage({ params }: FollowingPageProps) {
  const { username } = await params
  const session = await auth()

  const user = await db.user.findUnique({
    where: { username },
    select: { id: true, name: true, username: true },
  })

  if (!user) {
    notFound()
  }

  const following = await getFollowing(user.id, session?.user?.id)

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
        {user.name || user.username} segue
      </h1>

      {following.length === 0 ? (
        <div className="card p-8 text-center">
          <User className="mx-auto h-12 w-12 text-text-muted" />
          <p className="mt-4 text-text-muted">Não segue ninguém ainda</p>
        </div>
      ) : (
        <div className="space-y-3">
          {following.map((user) => (
            <div
              key={user.id}
              className="flex items-center gap-3 card p-4"
            >
              <Link href={`/profile/${user.username}`}>
                {user.avatarUrl ? (
                  <Image
                    src={user.avatarUrl}
                    alt={user.name || user.username || 'Avatar'}
                    width={48}
                    height={48}
                    className="rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-light/20 text-lg text-green-deep">
                    {(user.name || user.username || 'U')[0].toUpperCase()}
                  </div>
                )}
              </Link>

              <div className="flex-1">
                <Link
                  href={`/profile/${user.username}`}
                  className="font-medium text-text-dark hover:underline"
                >
                  {user.name || user.username}
                </Link>
                {user.name && user.username && (
                  <p className="text-sm text-text-muted">@{user.username}</p>
                )}
                {user.bio && (
                  <p className="mt-1 line-clamp-1 text-sm text-text-muted">{user.bio}</p>
                )}
              </div>

              {session?.user?.id && session.user.id !== user.id && (
                <FollowButton
                  userId={user.id}
                  initialIsFollowing={user.isFollowing}
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
