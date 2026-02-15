import { ImageResponse } from '@vercel/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)

  // Get parameters
  const title = searchParams.get('title') || 'Livro'
  const author = searchParams.get('author') || 'Autor'
  const coverUrl = searchParams.get('cover') || ''
  const rating = searchParams.get('rating') || ''
  const colorPrimary = searchParams.get('color1') || '#4C7052'
  const colorSecondary = searchParams.get('color2') || '#2D2A26'
  const format = searchParams.get('format') || 'story' // 'story' (1080x1920) or 'feed' (1080x1080)
  const username = searchParams.get('user') || ''

  const isStory = format === 'story'
  const width = 1080
  const height = isStory ? 1920 : 1080

  // Generate stars string
  const ratingNum = parseFloat(rating)
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
