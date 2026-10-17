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
  InstagramLogo,
  RedditLogo,
  TiktokLogo,
  Quotes,
  MusicNote,
  Calendar,
} from '@phosphor-icons/react/dist/ssr'
import { FollowButton } from '@/components/social/follow-button'
import { BadgesDisplay } from '@/components/gamification/badges-display'
import { ProfileShelf } from '@/components/profile/profile-shelf'
import { Avatar } from '@/components/ui/avatar'

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

  const bannerColor = profile.recentBooks.find((ub) => ub.book.colorPrimary)?.book.colorPrimary ?? null
  const displayName = profile.name || profile.username || 'Leitor'
  const statLinks = [
    { label: profile.stats.total === 1 ? 'livro' : 'livros', value: profile.stats.total },
    { label: profile.stats.read === 1 ? 'lido' : 'lidos', value: profile.stats.read },
    { label: 'lendo', value: profile.stats.reading },
    { label: profile._count.followers === 1 ? 'seguidor' : 'seguidores', value: profile._count.followers, href: `/profile/${username}/followers` },
    { label: 'seguindo', value: profile._count.following, href: `/profile/${username}/following` },
    { label: 'pontos', value: profile.points, href: isOwnProfile ? '/achievements' : undefined },
  ]

  return (
    <div className="mx-auto max-w-4xl px-4 py-6">
      <JsonLd data={personSchema} />

      {/* Faixa com a cor do livro mais recente */}
      <div
        aria-hidden
        className="h-28 rounded-2xl sm:h-36"
        style={{
          background: bannerColor
            ? `linear-gradient(120deg, ${bannerColor} 0%, color-mix(in srgb, ${bannerColor} 55%, #1d140d) 100%)`
            : 'var(--green-deep)',
        }}
      />

      <div className="-mt-12 flex items-end justify-between gap-4 px-2 sm:-mt-14 sm:px-6">
        <div className="ring-cream w-fit rounded-full ring-4">
          {profile.avatarUrl ? (
            <div className="relative h-24 w-24 overflow-hidden rounded-full sm:h-28 sm:w-28">
              <Image src={profile.avatarUrl} alt={displayName} fill className="object-cover" sizes="112px" />
            </div>
          ) : (
            <Avatar id={profile.id} name={displayName} size={104} />
          )}
        </div>

        <div className="flex items-center gap-2">
          {socialLinks?.instagram && (
            <a
              href={`https://instagram.com/${socialLinks.instagram}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-terracotta hover:bg-cream-dark rounded-full p-2 transition-colors"
              title="Instagram"
            >
              <InstagramLogo className="h-5 w-5" />
            </a>
          )}
          {socialLinks?.reddit && (
            <a
              href={`https://reddit.com/user/${socialLinks.reddit}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-terracotta hover:bg-cream-dark rounded-full p-2 transition-colors"
              title="Reddit"
            >
              <RedditLogo className="h-5 w-5" />
            </a>
          )}
          {socialLinks?.tiktok && (
            <a
              href={`https://tiktok.com/@${socialLinks.tiktok}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-text-muted hover:text-terracotta hover:bg-cream-dark rounded-full p-2 transition-colors"
              title="TikTok"
            >
              <TiktokLogo className="h-5 w-5" />
            </a>
          )}
          {isOwnProfile ? (
            <Link
              href="/settings"
              className="border-line bg-surface text-text-dark hover:bg-cream-dark rounded-lg border px-4 py-2 text-sm font-medium transition-colors"
            >
              Editar perfil
            </Link>
          ) : session?.user?.id ? (
            <FollowButton userId={profile.id} initialIsFollowing={isUserFollowing} />
          ) : null}
        </div>
      </div>

      <div className="mt-3 mb-8 space-y-3 px-2 sm:px-6">
        <div>
          <h1 className="font-fraunces text-text-dark text-3xl font-bold">{displayName}</h1>
          {profile.name && profile.username && <p className="text-text-muted">@{profile.username}</p>}
        </div>
        {profile.bio && <p className="text-text-dark max-w-2xl text-lg">{profile.bio}</p>}

        <ul className="text-text-muted flex flex-wrap gap-x-5 gap-y-1 text-sm">
          {statLinks.map(({ label, value, href }) => {
            const content = (
              <>
                <span className="text-text-dark font-semibold tabular-nums">{value.toLocaleString('pt-BR')}</span>{' '}
                {label}
              </>
            )
            return (
              <li key={label}>
                {href ? (
                  <Link href={href} className="hover:text-text-dark">
                    {content}
                  </Link>
                ) : (
                  content
                )}
              </li>
            )
          })}
          <li className="flex items-center gap-1.5">
            <Calendar className="h-4 w-4" />
            desde{' '}
            {new Date(profile.createdAt).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </li>
        </ul>
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

      {/* Badges */}
      {badges.length > 0 && (
        <div className="mb-8">
          <BadgesDisplay badges={badges} showLink={isOwnProfile} />
        </div>
      )}

      {/* Estante */}
      {profile.recentBooks.length > 0 && (
        <section>
          <h2 className="section-title mb-4 text-xl">Na estante</h2>
          <ProfileShelf books={profile.recentBooks} />
        </section>
      )}
    </div>
  )
}
