'use client'

import { useState } from 'react'
import { Target, PencilSimple, Check, X } from '@phosphor-icons/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { setReadingGoal } from '@/lib/actions/stats'
import type { ReadingGoalProgress } from '@/lib/services/stats'

interface ReadingGoalCardProps {
  goal: ReadingGoalProgress | null
  year: number
}

export function ReadingGoalCard({ goal, year }: ReadingGoalCardProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [targetBooks, setTargetBooks] = useState(goal?.target?.toString() || '12')
  const [isSaving, setIsSaving] = useState(false)

  async function handleSave() {
    const target = parseInt(targetBooks)
    if (isNaN(target) || target < 1) return

    setIsSaving(true)
    await setReadingGoal(year, target)
    setIsSaving(false)
    setIsEditing(false)
  }

  if (!goal && !isEditing) {
    return (
      <div className="rounded-2xl border-2 border-dashed border-cream-dark p-8 text-center">
        <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-green-deep/10">
          <Target className="h-7 w-7 text-green-deep" />
        </div>
        <h3 className="text-lg font-medium text-text-dark">
          Defina sua meta de leitura para {year}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Quantos livros você quer ler este ano?
        </p>
        <Button
          onClick={() => setIsEditing(true)}
          className="mt-4"
          variant="secondary"
        >
          Definir Meta
        </Button>
      </div>
    )
  }

  if (isEditing) {
    return (
      <div className="card p-5">
        <h3 className="mb-4 font-medium text-text-dark">
          Meta de leitura {year}
        </h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-text-muted">Quero ler</label>
          <Input
            type="number"
            min={1}
            max={365}
            value={targetBooks}
            onChange={(e) => setTargetBooks(e.target.value)}
            className="w-24"
          />
          <span className="text-sm text-text-muted">livros em {year}</span>
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSave} isLoading={isSaving}>
              <Check className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsEditing(false)}
              disabled={isSaving}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (!goal) return null

  const isGoalReached = goal.current >= goal.target

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-green-deep/10 p-2.5">
            <Target className="h-5 w-5 text-green-deep" weight="fill" />
          </div>
          <div>
            <h3 className="font-medium text-text-dark">
              Meta de leitura {year}
            </h3>
            <p className="text-sm text-text-muted">
              {goal.current} de {goal.target} livros
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsEditing(true)}
          className="rounded-lg p-2 text-text-muted transition-colors hover:bg-cream-dark hover:text-text-dark"
        >
          <PencilSimple className="h-4 w-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mt-4">
        <div className="flex items-center justify-between text-sm">
          <span className="tabular-nums text-text-muted">{goal.percentage}%</span>
          <span className={isGoalReached ? 'font-medium text-green-deep' : 'text-text-muted'}>
            {isGoalReached
              ? 'Meta alcançada!'
              : `Faltam ${goal.target - goal.current} livros`}
          </span>
        </div>
        <div className="mt-2 h-2.5 rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-deep to-green-accent transition-all duration-500"
            style={{ width: `${Math.min(goal.percentage, 100)}%` }}
          />
        </div>
      </div>

      {/* Monthly average needed */}
      {goal.current < goal.target && (
        <p className="mt-3 text-xs text-text-muted">
          {(() => {
            const currentMonth = new Date().getMonth()
            const remainingMonths = 12 - currentMonth
            const booksNeeded = goal.target - goal.current
            const perMonth = Math.ceil(booksNeeded / remainingMonths)
            return `Leia ~${perMonth} livro${perMonth > 1 ? 's' : ''} por mês para alcançar sua meta`
          })()}
        </p>
      )}
    </div>
  )
}
