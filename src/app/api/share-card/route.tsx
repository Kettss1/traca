import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'
import { z } from 'zod'

export const runtime = 'edge'

const hexColor = z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#4C7052')

const ALLOWED_COVER_HOSTS = [
  'books.google.com',
  'covers.openlibrary.org',
  'lh3.googleusercontent.com',
]

const safeCoverUrl = z.string().url().refine((url) => {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' && ALLOWED_COVER_HOSTS.includes(parsed.hostname)
  } catch {
    return false
  }
}, 'URL de capa não permitida')

const shareCardSchema = z.object({
  title: z.string().max(200).default('Livro'),
  author: z.string().max(100).default('Autor'),
  cover: safeCoverUrl.optional(),
  rating: z.string().regex(/^[0-5](\.[05])?$/).optional(),
  color1: hexColor,
  color2: z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#2D2A26'),
  format: z.enum(['story', 'feed']).default('story'),
  user: z.string().max(30).optional(),
})

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  const parsed = shareCardSchema.safeParse({
    title: searchParams.get('title') || undefined,
    author: searchParams.get('author') || undefined,
    cover: searchParams.get('cover') || undefined,
    rating: searchParams.get('rating') || undefined,
    color1: searchParams.get('color1') || undefined,
    color2: searchParams.get('color2') || undefined,
    format: searchParams.get('format') || undefined,
    user: searchParams.get('user') || undefined,
  })

  if (!parsed.success) {
    return new Response('Parâmetros inválidos', { status: 400 })
  }

  const { title, author, cover: coverUrl, rating, color1: colorPrimary, color2: colorSecondary, format, user: username } = parsed.data

  const isStory = format === 'story'
  const width = 1080
  const height = isStory ? 1920 : 1080

  // Generate stars string
  const ratingNum = rating ? parseFloat(rating) : 0
  const fullStars = Math.floor(ratingNum)
  const hasHalfStar = ratingNum % 1 >= 0.5
  const starsDisplay = rating
    ? '★'.repeat(fullStars) + (hasHalfStar ? '½' : '') + '☆'.repeat(5 - fullStars - (hasHalfStar ? 1 : 0))
    : ''

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `linear-gradient(135deg, ${colorPrimary} 0%, ${colorSecondary} 100%)`,
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        {/* Decorative elements */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />

        {/* Book cover */}
        {coverUrl ? (
          <div
            style={{
              display: 'flex',
              width: isStory ? 400 : 300,
              height: isStory ? 600 : 450,
              borderRadius: 16,
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
              overflow: 'hidden',
              marginBottom: isStory ? 60 : 40,
            }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={coverUrl}
              alt=""
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          </div>
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: isStory ? 400 : 300,
              height: isStory ? 600 : 450,
              borderRadius: 16,
              backgroundColor: 'rgba(255,255,255,0.1)',
              marginBottom: isStory ? 60 : 40,
            }}
          >
            <span style={{ fontSize: 120, opacity: 0.5 }}>📚</span>
          </div>
        )}

        {/* Title */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            padding: '0 60px',
            maxWidth: '100%',
          }}
        >
          <h1
            style={{
              fontSize: isStory ? 56 : 44,
              fontWeight: 700,
              color: '#FFFFFF',
              margin: 0,
              marginBottom: 16,
              textShadow: '0 2px 10px rgba(0,0,0,0.3)',
              lineHeight: 1.2,
              maxWidth: '900px',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {title}
          </h1>

          <p
            style={{
              fontSize: isStory ? 32 : 28,
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
              marginBottom: rating ? 24 : 0,
            }}
          >
            {author}
          </p>

          {/* Rating */}
          {rating && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 16,
              }}
            >
              <span style={{ fontSize: 36, color: '#FFD700' }}>{starsDisplay}</span>
              <span style={{ fontSize: 28, color: 'rgba(255,255,255,0.9)' }}>{rating}</span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div
          style={{
            position: 'absolute',
            bottom: isStory ? 80 : 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 8,
          }}
        >
          {username && (
            <p style={{ fontSize: 24, color: 'rgba(255,255,255,0.7)', margin: 0 }}>
              Lido por @{username}
            </p>
          )}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 28, fontWeight: 600, color: '#FFFFFF' }}>📖 Traça</span>
          </div>
        </div>
      </div>
    ),
    {
      width,
      height,
    }
  )
}
