'use client'

import { cn } from '@/lib/utils'
import type { ReadingStatus } from './shelf-filters'

interface StatusChipsProps {
  counts: Record<ReadingStatus, number>
  total: number
  selected: ReadingStatus | null
  onChange: (status: ReadingStatus | null) => void
}

const CHIPS: { value: ReadingStatus | null; label: string }[] = [
  { value: null, label: 'Todos' },
  { value: 'READING', label: 'Lendo' },
  { value: 'READ', label: 'Lidos' },
  { value: 'WANT_TO_READ', label: 'Quero ler' },
  { value: 'ABANDONED', label: 'Abandonados' },
]

export function StatusChips({ counts, total, selected, onChange }: StatusChipsProps) {
  return (
    <div
      role="group"
      aria-label="Filtrar por status"
      className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:flex-wrap sm:px-0"
    >
      {CHIPS.map(({ value, label }) => {
        const count = value ? counts[value] : total
        const isActive = selected === value
        if (value && count === 0) return null
        return (
          <button
            key={label}
            type="button"
            aria-pressed={isActive}
            onClick={() => onChange(isActive && value ? null : value)}
            className={cn(
              'flex shrink-0 items-center gap-2 rounded-full border px-4 py-1.5 text-sm transition-colors',
              isActive
                ? 'bg-green-deep text-on-brand border-transparent'
                : 'border-line bg-surface text-text-dark hover:border-green-deep/40'
            )}
          >
            {label}
            <span
              className={cn(
                'tabular-nums text-xs',
                isActive ? 'text-on-brand/80' : 'text-text-muted'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
