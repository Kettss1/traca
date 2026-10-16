'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Trophy, Books, FileText } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

type LeaderboardType = 'points' | 'books' | 'pages'

interface LeaderboardEntry {
  id: string
  username: string | null
  name: string | null
  avatarUrl: string | null
  points?: number
  booksRead?: number
  pagesRead?: number
}

interface LeaderboardProps {
  pointsData: LeaderboardEntry[]
  booksData: LeaderboardEntry[]
  pagesData: LeaderboardEntry[]
}

const MEDAL_COLORS = [
  'bg-terracotta-light text-white',
  'bg-text-muted/30 text-text-dark',
  'bg-brown/30 text-brown',
]

export function Leaderboard({ pointsData, booksData, pagesData }: LeaderboardProps) {
  const [activeTab, setActiveTab] = useState<LeaderboardType>('points')

  const data =
    activeTab === 'points' ? pointsData : activeTab === 'books' ? booksData : pagesData

  const getValue = (entry: LeaderboardEntry) => {
    if (activeTab === 'points') return entry.points?.toLocaleString('pt-BR') || '0'
    if (activeTab === 'books') return entry.booksRead?.toString() || '0'
    return entry.pagesRead?.toLocaleString('pt-BR') || '0'
  }

  const getLabel = () => {
    if (activeTab === 'points') return 'pts'
    if (activeTab === 'books') return 'livros'
    return 'pág.'
  }

  return (
    <div className="card p-5">
      <h2 className="section-title mb-4">
        Ranking
      </h2>

      {/* Tabs */}
      <div className="mb-4 flex gap-1 rounded-xl bg-cream-dark/60 p-1">
        {([
          { key: 'points' as const, icon: Trophy, label: 'Pontos' },
          { key: 'books' as const, icon: Books, label: 'Livros' },
          { key: 'pages' as const, icon: FileText, label: 'Pág.' },
        ]).map(({ key, icon: Icon, label }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              'flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-xs font-medium transition-all',
              activeTab === key
                ? 'bg-surface text-green-deep shadow-sm'
                : 'text-text-muted hover:text-text-dark'
            )}
          >
            <Icon className="h-3.5 w-3.5" weight={activeTab === key ? 'fill' : 'regular'} />
            {label}
          </button>
        ))}
      </div>

      {/* Entries */}
      <div className="space-y-2">
        {data.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center gap-2.5 rounded-xl bg-cream-dark/30 p-2.5"
          >
            <div
              className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                index < 3 ? MEDAL_COLORS[index] : 'bg-cream-dark text-text-muted'
              )}
            >
              {index + 1}
            </div>

            <Link href={`/profile/${entry.username}`} className="flex min-w-0 flex-1 items-center gap-2">
              {entry.avatarUrl ? (
                <Image
                  src={entry.avatarUrl}
                  alt={entry.name || entry.username || 'Avatar'}
                  width={28}
                  height={28}
                  className="h-7 w-7 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-green-deep/10 text-xs font-medium text-green-deep">
                  {(entry.name || entry.username || 'U')[0].toUpperCase()}
                </div>
              )}
              <span className="truncate text-sm font-medium text-text-dark hover:text-green-deep">
                {entry.name || entry.username}
              </span>
            </Link>

            <span className="shrink-0 text-xs font-medium tabular-nums text-green-deep">
              {getValue(entry)} <span className="text-text-muted">{getLabel()}</span>
            </span>
          </div>
        ))}

        {data.length === 0 && (
          <p className="py-4 text-center text-sm text-text-muted">
            Nenhum dado disponível
          </p>
        )}
      </div>
    </div>
  )
}
