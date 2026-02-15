'use client'

import type { AuthorStats } from '@/lib/services/stats'

interface AuthorChartProps {
  data: AuthorStats[]
}

export function AuthorChart({ data }: AuthorChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        Nenhum autor registrado ainda
      </div>
    )
  }

  const top5 = data.slice(0, 5)
  const maxCount = top5[0].count

  return (
    <div className="space-y-3 py-2">
      {top5.map((author, index) => (
        <div key={author.name} className="flex items-center gap-3">
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-deep/10 text-xs font-bold text-green-deep">
            {index + 1}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-sm font-medium text-text-dark">
                {author.name}
              </span>
              <span className="shrink-0 text-sm tabular-nums text-text-muted">
                {author.count}
              </span>
            </div>
            <div className="mt-1.5 h-1.5 rounded-full bg-cream-dark">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${(author.count / maxCount) * 100}%`,
                  backgroundColor: `color-mix(in srgb, #115e59 ${100 - index * 15}%, #14b8a6)`,
                }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
