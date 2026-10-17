import {
  Archive,
  Bank,
  BookBookmark,
  BookOpenText,
  Books,
  Butterfly,
  Crown,
  Diamond,
  Files,
  Fire,
  Medal,
  Megaphone,
  MoonStars,
  PencilLine,
  PersonSimpleRun,
  Plant,
  Quotes,
  Trophy,
  UsersThree,
} from '@phosphor-icons/react/dist/ssr'
import type { Icon } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

const ICONS: Record<string, Icon> = {
  FIRST_BOOK: BookBookmark,
  BOOKWORM_10: Plant,
  BOOKWORM_25: BookOpenText,
  BOOKWORM_50: Books,
  BOOKWORM_100: Crown,
  PAGE_TURNER_1000: Files,
  PAGE_TURNER_10000: PersonSimpleRun,
  STREAK_MASTER: Fire,
  COLLECTOR_25: Archive,
  COLLECTOR_100: Bank,
  ANNOTATOR: PencilLine,
  QUOTE_LOVER: Quotes,
  SOCIAL_BUTTERFLY: Butterfly,
  INFLUENCER: Megaphone,
  COMMUNITY_MEMBER: UsersThree,
  POINTS_500: Diamond,
  POINTS_2000: Trophy,
  NIGHT_OWL: MoonStars,
  VETERAN: Medal,
}

export const CATEGORY_COLOR: Record<string, string> = {
  reading: 'var(--green-deep)',
  collection: '#8a5a2b',
  social: '#5f4a85',
  streak: 'var(--terracotta)',
  points: '#a17a1f',
  loyalty: '#36557a',
}

interface AchievementIconProps {
  code: string
  /** emoji salvo no banco, usado quando o código não tem ícone mapeado */
  fallback: string
  category: string
  earned: boolean
  size?: number
  className?: string
}

/** Medalha redonda: preenchida na cor da categoria quando conquistada, contorno quando não. */
export function AchievementIcon({ code, fallback, category, earned, size = 44, className }: AchievementIconProps) {
  const Icon = ICONS[code]
  const color = CATEGORY_COLOR[category] ?? 'var(--green-deep)'
  return (
    <span
      className={cn('flex shrink-0 items-center justify-center rounded-full', className)}
      style={{
        width: size,
        height: size,
        backgroundColor: earned ? color : 'transparent',
        border: earned ? 'none' : '1.5px dashed var(--line)',
        color: earned ? '#fff' : 'var(--text-muted)',
        boxShadow: earned ? `inset 0 -3px 0 rgb(0 0 0 / 0.15), 0 0 0 3px color-mix(in srgb, ${color} 18%, transparent)` : undefined,
      }}
    >
      {Icon ? (
        <Icon weight={earned ? 'fill' : 'regular'} style={{ width: size * 0.48, height: size * 0.48 }} />
      ) : (
        <span style={{ fontSize: size * 0.45 }}>{fallback}</span>
      )}
    </span>
  )
}
