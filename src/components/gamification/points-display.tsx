'use client'

import { Trophy, Coin } from '@phosphor-icons/react'

interface PointsDisplayProps {
  points: number
  coins: number
  compact?: boolean
}

export function PointsDisplay({ points, coins, compact = false }: PointsDisplayProps) {
  if (compact) {
    return (
      <div className="flex items-center gap-3 text-sm">
        <span className="flex items-center gap-1 font-medium text-green-deep">
          <Trophy className="h-4 w-4" weight="fill" />
          {points.toLocaleString('pt-BR')}
        </span>
        <span className="flex items-center gap-1 font-medium text-terracotta">
          <Coin className="h-4 w-4" weight="fill" />
          {coins.toLocaleString('pt-BR')}
        </span>
      </div>
    )
  }

  return (
    <div className="flex gap-3">
      <div className="flex items-center gap-2.5 rounded-2xl border border-green-deep/20 bg-green-deep/5 px-4 py-2.5">
        <div className="rounded-xl bg-green-deep/10 p-1.5">
          <Trophy className="h-5 w-5 text-green-deep" weight="fill" />
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-green-deep">{points.toLocaleString('pt-BR')}</p>
          <p className="text-[11px] text-text-muted">pontos</p>
        </div>
      </div>

      <div className="flex items-center gap-2.5 rounded-2xl border border-terracotta/20 bg-terracotta/5 px-4 py-2.5">
        <div className="rounded-xl bg-terracotta/10 p-1.5">
          <Coin className="h-5 w-5 text-terracotta" weight="fill" />
        </div>
        <div>
          <p className="text-lg font-bold tabular-nums text-terracotta">{coins.toLocaleString('pt-BR')}</p>
          <p className="text-[11px] text-text-muted">moedas</p>
        </div>
      </div>
    </div>
  )
}
