'use client'

import { useSyncExternalStore, useCallback } from 'react'

const STORAGE_KEY = 'lertraca-shelf-theme'
const DEFAULT_THEME = 'classic-wood'

// Store for the current theme
let currentTheme = DEFAULT_THEME
const listeners = new Set<() => void>()

function notifyListeners() {
  listeners.forEach((listener) => listener())
}

function subscribe(callback: () => void): () => void {
  listeners.add(callback)
  return () => listeners.delete(callback)
}

function getSnapshot(): string {
  return currentTheme
}

function getServerSnapshot(): string {
  return DEFAULT_THEME
}

// Initialize from localStorage (only on client)
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored) {
    currentTheme = stored
  }
}

export function useShelfTheme() {
  const shelfThemeId = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const setShelfTheme = useCallback((themeId: string) => {
    currentTheme = themeId
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, themeId)
    }
    notifyListeners()
  }, [])

  return { shelfThemeId, setShelfTheme }
}
