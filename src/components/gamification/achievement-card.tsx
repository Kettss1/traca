import { cn } from '@/lib/utils'
import { AchievementIcon, CATEGORY_COLOR } from './achievement-icon'

interface AchievementCardProps {
  code: string
  name: string
  description: string
  icon: string
  category: string
  points: number
  isEarned: boolean
  earnedAt: Date | null
  progress: number
  progressCurrent: number | null
  progressTarget: number | null
}

const num = new Intl.NumberFormat('pt-BR')

export function AchievementCard({
  code,
  name,
  description,
  icon,
  category,
  points,
  isEarned,
  earnedAt,
  progress,
  progressCurrent,
  progressTarget,
}: AchievementCardProps) {
  const color = CATEGORY_COLOR[category] ?? 'var(--green-deep)'

  return (
    <div className={cn('flex items-start gap-3 rounded-2xl p-4', isEarned ? 'card' : 'border-line border border-dashed')}>
      <AchievementIcon code={code} fallback={icon} category={category} earned={isEarned} />

      <div className="min-w-0 flex-1">
        <h3 className={cn('text-sm font-semibold', isEarned ? 'text-text-dark' : 'text-text-dark/80')}>{name}</h3>
        <p className="text-text-muted mt-0.5 text-sm leading-snug">{description}</p>

        {isEarned ? (
          <p className="text-text-muted mt-2 flex items-center gap-2 text-xs">
            {points > 0 && <span className="text-green-deep font-medium">+{points} pts</span>}
            {earnedAt && <span>{new Date(earnedAt).toLocaleDateString('pt-BR')}</span>}
          </p>
        ) : progressTarget ? (
          <div className="mt-2.5">
            <div className="bg-cream-dark h-1.5 overflow-hidden rounded-full">
              <div className="h-full rounded-full" style={{ width: `${progress}%`, backgroundColor: color }} />
            </div>
            <p className="text-text-muted mt-1 text-xs tabular-nums">
              {num.format(progressCurrent ?? 0)} de {num.format(progressTarget)}
            </p>
          </div>
        ) : null}
      </div>
    </div>
  )
}
