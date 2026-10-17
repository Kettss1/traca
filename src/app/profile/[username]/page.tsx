import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { auth } from '@/lib/auth'
import { getPublicProfile } from '@/lib/actions/profile'
import { isFollowing } from '@/lib/services/social'
import { getEarnedBadges } from '@/lib/services/gamification'
import { generatePersonSchema } from '@/lib/seo/structured-data'
import { JsonLd } from '@/components/seo/json-ld'
import { parseQuote } from '@/lib/utils'
import {
  User,
  Books,
  BookOpen,
  BookmarkSimple,
  InstagramLogo,
  RedditLogo,
  TiktokLogo,
  Quotes,
  MusicNote,
  Calendar,
  Users,
  Trophy,
} from '@phosphor-icons/react/dist/ssr'
import { FollowButton } from '@/components/social/follow-button'
import { BadgesDisplay } from '@/components/gamification/badges-display'

// ISR: revalidate profile pages every 5 minutes
export const revalidate = 300

interface ProfilePageProps {
  params: Promise<{ username: string }>
}

export async function generateMetadata({ params }: ProfilePageProps) {
  const { username } = await params
  const profile = await getPublicProfile(username)
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'

  if (!profile) {
    return { title: 'Usuário não encontrado' }
  }

  const displayName = profile.name || profile.username
  const description =
    profile.bio || `Veja o perfil de ${displayName} no Traça - ${profile.stats.read} livros lidos`

  return {
    title: `${displayName}`,
    description,
    openGraph: {
      title: `${displayName} no Traça`,
      description,
      type: 'profile',
      url: `${baseUrl}/profile/${username}`,
      images: profile.avatarUrl ? [{ url: profile.avatarUrl, alt: displayName }] : [],
    },
    twitter: {
      card: 'summary',
      title: `${displayName} no Traça`,
      description,
      images: profile.avatarUrl ? [profile.avatarUrl] : [],
    },
  }
}

export default async function ProfilePage({ params }: ProfilePageProps) {
  const { username } = await params
  const session = await auth()
  const profile = await getPublicProfile(username)

  if (!profile) {
    notFound()
  }

  const isOwnProfile = session?.user?.id === profile.id
  const [isUserFollowing, badges] = await Promise.all([
    session?.user?.id && !isOwnProfile
      ? isFollowing(session.user.id, profile.id)
      : Promise.resolve(false),
    getEarnedBadges(profile.id),
  ])
  const socialLinks = profile.socialLinks as {
    instagram?: string
    reddit?: string
    tiktok?: string
  } | null
  const quote = profile.quote ? parseQuote(profile.quote) : null

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://lertraca.com.br'
  const personSchema = generatePersonSchema({
    name: profile.name || profile.username || 'Usuário',
    username: profile.username || '',
    bio: profile.bio || undefined,
    avatarUrl: profile.avatarUrl || undefined,
    url: `${baseUrl}/profile/${username}`,
  })

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <JsonLd data={personSchema} />
      {/* Header */}
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        {/* Avatar */}
        <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-full bg-cream-dark">
          {profile.avatarUrl ? (
            <Image
              src={profile.avatarUrl}
              alt={profile.name || profile.username || 'Avatar'}
              fill
              className="object-cover"
              sizes="128px"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <User className="h-16 w-16 text-text-muted" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 text-center sm:text-left">
          <h1 className="font-fraunces text-3xl font-bold text-text-dark">
            {profile.name || profile.username}
          </h1>
          {profile.name && profile.username && (
            <p className="mt-1 text-text-muted">@{profile.username}</p>
          )}

          {profile.bio && (
            <p className="mt-3 text-text-dark">{profile.bio}</p>
          )}

          {/* Social links */}
          {socialLinks && (socialLinks.instagram || socialLinks.reddit || socialLinks.tiktok) && (
            <div className="mt-4 flex justify-center gap-3 sm:justify-start">
              {socialLinks.instagram && (
                <a
                  href={`https://instagram.com/${socialLinks.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream-dark p-2 text-text-muted transition-colors hover:bg-terracotta/20 hover:text-terracotta"
                  title="Instagram"
                >
                  <InstagramLogo className="h-5 w-5" />
                </a>
              )}
              {socialLinks.reddit && (
                <a
                  href={`https://reddit.com/user/${socialLinks.reddit}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream-dark p-2 text-text-muted transition-colors hover:bg-orange-500/20 hover:text-orange-500"
                  title="Reddit"
                >
                  <RedditLogo className="h-5 w-5" />
                </a>
              )}
              {socialLinks.tiktok && (
                <a
                  href={`https://tiktok.com/@${socialLinks.tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-cream-dark p-2 text-text-muted transition-colors hover:bg-black/10 hover:text-black"
                  title="TikTok"
                >
                  <TiktokLogo className="h-5 w-5" />
                </a>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="mt-4 flex flex-wrap justify-center gap-3 sm:justify-start">
            {isOwnProfile ? (
              <Link
                href="/settings"
                className="inline-block rounded-lg bg-green-deep px-4 py-2 text-sm font-medium text-on-brand transition-colors hover:bg-green-deep/90"
              >
                Editar Perfil
              </Link>
            ) : session?.user?.id ? (
              <FollowButton userId={profile.id} initialIsFollowing={isUserFollowing} />
            ) : null}
          </div>

          {/* Join date */}
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-text-muted sm:justify-start">
            <Calendar className="h-4 w-4" />
            <span>
              Membro desde{' '}
              {new Date(profile.createdAt).toLocaleDateString('pt-BR', {
                month: 'long',
                year: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Quote */}
      {quote && (
        <figure className="mb-8 card p-6">
          <div className="flex items-start gap-3">
            <Quotes className="h-6 w-6 flex-shrink-0 text-terracotta" weight="fill" />
            <div>
              <blockquote className="font-fraunces text-lg italic text-text-dark">
                &ldquo;{quote.text}&rdquo;
              </blockquote>
              {quote.author && (
                <figcaption className="mt-2 text-sm text-text-muted">— {quote.author}</figcaption>
              )}
            </div>
          </div>
        </figure>
      )}

      {/* Music */}
      {profile.musicUrl && (
        <div className="mb-8 card p-4">
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <MusicNote className="h-4 w-4" />
            <span>Música favorita</span>
          </div>
          <a
            href={profile.musicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 block text-green-deep hover:underline"
          >
            {profile.musicUrl}
          </a>
        </div>
      )}

      {/* Stats */}
      <div className="mb-8 grid grid-cols-3 gap-4 sm:grid-cols-6">
        <div className="card p-4 text-center">
          <Books className="mx-auto h-6 w-6 text-green-deep" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile.stats.total}</p>
          <p className="text-sm text-text-muted">Livros</p>
        </div>
        <div className="card p-4 text-center">
          <BookOpen className="mx-auto h-6 w-6 text-green-deep" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile.stats.reading}</p>
          <p className="text-sm text-text-muted">Lendo</p>
        </div>
        <div className="card p-4 text-center">
          <BookmarkSimple className="mx-auto h-6 w-6 text-green-deep" weight="fill" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile.stats.read}</p>
          <p className="text-sm text-text-muted">Lidos</p>
        </div>
        <Link
          href={`/profile/${username}/followers`}
          className="card p-4 text-center transition-colors hover:bg-cream-dark"
        >
          <Users className="mx-auto h-6 w-6 text-terracotta" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile._count.followers}</p>
          <p className="text-sm text-text-muted">Seguidores</p>
        </Link>
        <Link
          href={`/profile/${username}/following`}
          className="card p-4 text-center transition-colors hover:bg-cream-dark"
        >
          <User className="mx-auto h-6 w-6 text-terracotta" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile._count.following}</p>
          <p className="text-sm text-text-muted">Seguindo</p>
        </Link>
        <Link
          href="/achievements"
          className="card p-4 text-center transition-colors hover:bg-cream-dark"
        >
          <Trophy className="mx-auto h-6 w-6 text-terracotta" />
          <p className="mt-2 text-2xl font-bold text-text-dark">{profile.points.toLocaleString('pt-BR')}</p>
          <p className="text-sm text-text-muted">Pontos</p>
        </Link>
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-8">
          <BadgesDisplay badges={badges} showLink={isOwnProfile} />
        </div>
      )}

      {/* Recent books */}
      {profile.recentBooks.length > 0 && (
        <div>
          <h2 className="font-fraunces mb-4 text-xl font-semibold text-text-dark">
            Livros Recentes
          </h2>
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6">
            {profile.recentBooks.map((userBook) => (
              <Link
                key={userBook.id}
                href={`/book/${userBook.book.id}`}
                className="group"
              >
                <div
                  className="aspect-[2/3] overflow-hidden rounded-lg shadow-md transition-transform group-hover:scale-105"
                  style={{ backgroundColor: userBook.book.colorPrimary || '#e2e8f0' }}
                >
                  {userBook.book.coverUrl ? (
                    <Image
                      src={userBook.book.coverUrl}
                      alt={userBook.book.title}
                      width={120}
                      height={180}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <BookOpen className="h-8 w-8 text-white/60" />
                    </div>
                  )}
                </div>
                <p className="mt-2 line-clamp-1 text-xs text-text-muted">
                  {userBook.book.title}
                </p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
