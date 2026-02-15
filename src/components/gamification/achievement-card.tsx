'use client'

import { cn } from '@/lib/utils'
import { Lock } from '@phosphor-icons/react'

interface AchievementCardProps {
  name: string
  description: string
  icon: string
  category: string
  points: number
  coins: number
  isEarned: boolean
  earnedAt: Date | null
  progress: number
}

const CATEGORY_STYLES: Record<string, { earned: string; icon: string }> = {
  reading: { earned: 'border-green-deep/30 bg-green-deep/5', icon: 'bg-green-deep/10' },
  collection: { earned: 'border-brown/30 bg-brown/5', icon: 'bg-brown/10' },
  social: { earned: 'border-green-accent/30 bg-green-accent/5', icon: 'bg-green-accent/10' },
  streak: { earned: 'border-terracotta/30 bg-terracotta/5', icon: 'bg-terracotta/10' },
  points: { earned: 'border-terracotta-light/30 bg-terracotta-light/5', icon: 'bg-terracotta-light/10' },
  loyalty: { earned: 'border-green-light/30 bg-green-light/5', icon: 'bg-green-light/10' },
}

const DEFAULT_STYLE = { earned: 'border-cream-dark bg-cream-dark/20', icon: 'bg-cream-dark' }

export function AchievementCard({
  name,
  description,
  icon,
  category,
  points,
  coins,
  isEarned,
  earnedAt,
  progress,
}: AchievementCardProps) {
  const style = CATEGORY_STYLES[category] || DEFAULT_STYLE

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border p-4 transition-all',
        isEarned
          ? style.earned
          : 'border-cream-dark/60 bg-cream-dark/10 opacity-60'
      )}
    >
      {!isEarned && (
        <div className="absolute inset-0 flex items-center justify-center bg-cream/40">
          <Lock className="h-6 w-6 text-text-muted/50" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-xl',
            isEarned ? style.icon : 'bg-cream-dark/50'
          )}
        >
          {icon}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={cn(
              'text-sm font-semibold',
              isEarned ? 'text-text-dark' : 'text-text-muted'
            )}
          >
            {name}
          </h3>
          <p className="mt-0.5 text-xs leading-relaxed text-text-muted">{description}</p>

          {!isEarned && progress > 0 && progress < 100 && (
            <div className="mt-2">
              <div className="h-1 rounded-full bg-cream-dark">
                <div
                  className="h-full rounded-full bg-green-deep transition-all"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="mt-1 text-[11px] tabular-nums text-text-muted">{progress}%</p>
            </div>
          )}

          {isEarned && (
            <div className="mt-2 flex items-center gap-2.5 text-[11px]">
              {points > 0 && (
                <span className="font-medium text-green-deep">+{points} pts</span>
              )}
              {coins > 0 && (
                <span className="font-medium text-terracotta">+{coins} moedas</span>
              )}
              {earnedAt && (
                <span className="text-text-muted">
                  {new Date(earnedAt).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
