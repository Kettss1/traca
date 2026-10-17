'use client'

import { useSyncExternalStore } from 'react'
import { useTheme } from 'next-themes'
import { Moon, Sun } from '@phosphor-icons/react'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  // false no servidor, true no cliente — evita hydration mismatch sem setState em effect
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false
  )

  const isDark = mounted && resolvedTheme === 'dark'
  const label = isDark ? 'Usar tema claro' : 'Usar tema escuro'

  return (
    <button
      type="button"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="text-text-muted hover:bg-cream-dark hover:text-text-dark rounded-lg p-2 transition-colors"
      title={label}
      aria-label={label}
    >
      {/* Antes de montar não sabemos o tema: ícone neutro evita hydration mismatch */}
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
}
