'use client'

import Link from 'next/link'

interface Badge {
  achievement: {
    icon: string
    name: string
  }
  earnedAt: Date | null
}

interface BadgesDisplayProps {
  badges: Badge[]
  username: string
  showLink?: boolean
}

export function BadgesDisplay({ badges, username, showLink = true }: BadgesDisplayProps) {
  if (badges.length === 0) {
    return null
  }

  return (
    <div className="card p-4">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-text-dark">Conquistas</h3>
        {showLink && (
          <Link
            href={`/profile/${username}/achievements`}
            className="text-xs font-medium text-green-deep hover:text-green-light"
          >
            Ver todas
          </Link>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {badges.map((badge, index) => (
          <div
            key={index}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-cream-dark/40 text-xl"
            title={badge.achievement.name}
          >
            {badge.achievement.icon}
          </div>
        ))}
      </div>
    </div>
  )
}
