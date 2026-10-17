'use client'

import { MagnifyingGlass, X } from '@phosphor-icons/react'

interface ShelfSearchProps {
  value: string
  onChange: (value: string) => void
}

export function ShelfSearch({ value, onChange }: ShelfSearchProps) {
  return (
    <div className="relative">
      <MagnifyingGlass className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Buscar na estante..."
        className="w-full rounded-lg border border-line bg-surface py-2 pl-10 pr-10 text-sm text-text-dark placeholder:text-text-muted focus:border-green-deep focus:outline-none focus:ring-2 focus:ring-green-deep/20"
      />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-dark"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}
