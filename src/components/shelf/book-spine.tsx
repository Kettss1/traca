'use client'

import { cn } from '@/lib/utils'

interface BookSpineProps {
  title: string
  authors: string[]
  colorPrimary?: string
  colorSecondary?: string
  pageCount?: number
  onClick?: () => void
  className?: string
}

export function BookSpine({
  title,
  authors,
  colorPrimary,
  colorSecondary,
  pageCount,
  onClick,
  className,
}: BookSpineProps) {
  // Calculate spine width based on page count (min 28px, max 64px)
  const baseWidth = pageCount ? Math.min(Math.max(pageCount / 8, 28), 64) : 36

  // Determine text color based on background brightness
  const bgColor = colorPrimary || '#8B7355'
  const isLightBackground = isLightColor(bgColor)
  const textColor = isLightBackground ? '#1a1714' : '#FFF8F0'
  const textShadow = isLightBackground
    ? '0 0 4px rgba(255,255,255,0.4)'
    : '0 0 4px rgba(0,0,0,0.5)'

  return (
    <button
      onClick={onClick}
      className={cn(
        'group relative flex h-full flex-col items-center justify-end overflow-hidden rounded-sm transition-all duration-200',
        'hover:-translate-y-2',
        'focus:outline-none focus-visible:brightness-125',
        className
      )}
      style={{
        width: `${baseWidth}px`,
        background: colorSecondary
          ? `linear-gradient(160deg, ${colorPrimary || '#8B7355'} 0%, ${colorSecondary} 100%)`
          : colorPrimary || '#8B7355',
        boxShadow: '2px 2px 6px rgba(0,0,0,0.3), inset -1px 0 0 rgba(0,0,0,0.15)',
      }}
      title={`${title} - ${authors.join(', ')}`}
    >
      {/* Spine edge highlight (left = light hitting the edge) */}
      <div
        className="absolute left-0 top-0 h-full w-[2px]"
        style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}
      />

      {/* Subtle right edge shadow */}
      <div
        className="absolute right-0 top-0 h-full w-[1px]"
        style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
      />

      {/* Title (vertical) */}
      <div
        className="absolute left-1/2 top-1/2 origin-center -translate-x-1/2 -translate-y-1/2 -rotate-90 whitespace-nowrap px-1"
        style={{ color: textColor }}
      >
        <span
          className="block truncate text-xs font-semibold leading-tight tracking-wide"
          style={{ maxWidth: '130px', textShadow }}
        >
          {title}
        </span>
      </div>

      {/* Author initial at bottom */}
      {authors[0] && (
        <div
          className="absolute bottom-1.5 left-1/2 -translate-x-1/2 text-[9px] font-bold opacity-50"
          style={{ color: textColor, textShadow }}
        >
          {authors[0].charAt(0).toUpperCase()}
        </div>
      )}
    </button>
  )
}

// Helper function to determine if a color is light or dark
function isLightColor(color: string): boolean {
  // Handle hex colors
  const hex = color.replace('#', '')
  if (hex.length !== 6) return false

  const r = parseInt(hex.substr(0, 2), 16)
  const g = parseInt(hex.substr(2, 2), 16)
  const b = parseInt(hex.substr(4, 2), 16)

  // Calculate relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255

  return luminance > 0.5
}
