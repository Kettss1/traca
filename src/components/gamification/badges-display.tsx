import Link from 'next/link'
import { AchievementIcon } from './achievement-icon'

interface Badge {
  achievement: {
    code: string
    icon: string
    name: string
    category: string
  }
  earnedAt: Date | null
}

interface BadgesDisplayProps {
  badges: Badge[]
  /** link "ver todas" só faz sentido no próprio perfil (a página é /achievements) */
  showLink?: boolean
}

export function BadgesDisplay({ badges, showLink = false }: BadgesDisplayProps) {
  if (badges.length === 0) {
    return null
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="section-title text-base">Conquistas</h3>
        {showLink && (
          <Link href="/achievements" className="text-green-deep hover:text-green-light text-sm font-medium">
            Ver todas
          </Link>
        )}
      </div>

      <ul className="flex flex-wrap gap-2.5">
        {badges.map((badge) => (
          <li key={badge.achievement.code} title={badge.achievement.name}>
            <AchievementIcon
              code={badge.achievement.code}
              fallback={badge.achievement.icon}
              category={badge.achievement.category}
              earned
              size={40}
            />
            <span className="sr-only">{badge.achievement.name}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
