'use client'

import { useTheme } from 'next-themes'
import { Sun, Moon, Monitor, Check, Lock } from '@phosphor-icons/react'
import { shelfThemes, type ShelfTheme } from '@/lib/themes'
import { useShelfTheme } from '@/hooks/use-shelf-theme'
import { cn } from '@/lib/utils'

export function ThemeSelector() {
  const { theme, setTheme } = useTheme()
  const { shelfThemeId, setShelfTheme } = useShelfTheme()

  return (
    <div className="space-y-8">
      {/* Color mode selector */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-text-dark dark:text-white">
          Modo de Cor
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              theme === 'light'
                ? 'border-green-deep bg-green-light/10'
                : 'border-brown/20 hover:border-green-deep/50 dark:border-gray-600'
            )}
          >
            <Sun className="h-6 w-6 text-amber-500" />
            <span className="text-sm font-medium text-text-dark dark:text-white">Claro</span>
            {theme === 'light' && <Check className="h-4 w-4 text-green-deep" />}
          </button>
          <button
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              theme === 'dark'
                ? 'border-green-deep bg-green-light/10'
                : 'border-brown/20 hover:border-green-deep/50 dark:border-gray-600'
            )}
          >
            <Moon className="h-6 w-6 text-indigo-400" />
            <span className="text-sm font-medium text-text-dark dark:text-white">Escuro</span>
            {theme === 'dark' && <Check className="h-4 w-4 text-green-deep" />}
          </button>
          <button
            onClick={() => setTheme('system')}
            className={cn(
              'flex flex-1 flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors',
              theme === 'system'
                ? 'border-green-deep bg-green-light/10'
                : 'border-brown/20 hover:border-green-deep/50 dark:border-gray-600'
            )}
          >
            <Monitor className="h-6 w-6 text-text-muted" />
            <span className="text-sm font-medium text-text-dark dark:text-white">Sistema</span>
            {theme === 'system' && <Check className="h-4 w-4 text-green-deep" />}
          </button>
        </div>
      </div>

      {/* Shelf theme selector */}
      <div className="rounded-lg bg-white p-6 shadow-sm dark:bg-gray-800">
        <h2 className="mb-4 text-lg font-medium text-text-dark dark:text-white">
          Tema da Estante
        </h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {shelfThemes.map((shelfTheme) => (
            <ShelfThemeCard
              key={shelfTheme.id}
              theme={shelfTheme}
              isSelected={shelfThemeId === shelfTheme.id}
              isLocked={!!shelfTheme.unlockCondition}
              onSelect={() => setShelfTheme(shelfTheme.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function ShelfThemeCard({
  theme,
  isSelected,
  isLocked,
  onSelect,
}: {
  theme: ShelfTheme
  isSelected: boolean
  isLocked: boolean
  onSelect: () => void
}) {
  return (
    <button
      onClick={onSelect}
      disabled={isLocked}
      className={cn(
        'relative overflow-hidden rounded-lg border-2 p-1 text-left transition-all',
        isSelected
          ? 'border-green-deep ring-2 ring-green-deep/20'
          : 'border-brown/20 hover:border-green-deep/50 dark:border-gray-600',
        isLocked && 'cursor-not-allowed opacity-60'
      )}
    >
      {/* Mini shelf preview */}
      <div className="relative h-20 overflow-hidden rounded-md">
        {/* Back */}
        <div
          className="absolute inset-0"
          style={{ background: theme.shelfBack }}
        />
        {/* Mini books */}
        <div className="absolute bottom-3 left-2 flex h-12 items-end gap-0.5">
          {[16, 12, 20, 14, 18, 10, 16].map((height, i) => (
            <div
              key={i}
              className="rounded-sm"
              style={{
                width: '6px',
                height: `${height}px`,
                backgroundColor: ['#8B7355', '#C08B8F', '#4A3B6B', '#6B5A47', '#D4A0A4', '#3D3158', '#5D4E3C'][i],
              }}
            />
          ))}
        </div>
        {/* Board */}
        <div
          className="absolute inset-x-0 bottom-0 h-3"
          style={{ background: theme.shelfBoard }}
        />
      </div>

      {/* Info */}
      <div className="p-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-text-dark dark:text-white">
            {theme.name}
          </span>
          {isSelected && <Check className="h-4 w-4 text-green-deep" />}
          {isLocked && <Lock className="h-4 w-4 text-text-muted" />}
        </div>
        <p className="mt-0.5 text-xs text-text-muted">{theme.description}</p>
        {isLocked && theme.unlockCondition && (
          <p className="mt-1 text-xs text-terracotta">{theme.unlockCondition}</p>
        )}
      </div>
    </button>
  )
}
