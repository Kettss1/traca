'use client'

import { useSyncExternalStore } from 'react'

const QUERY = '(prefers-reduced-motion: reduce)'

function subscribe(callback: () => void): () => void {
  const mediaQuery = window.matchMedia(QUERY)
  mediaQuery.addEventListener('change', callback)
  return () => mediaQuery.removeEventListener('change', callback)
}

function getSnapshot(): boolean {
  return window.matchMedia(QUERY).matches
}

function getServerSnapshot(): boolean {
  // Default to false on server (assume full animations)
  return false
}

export function useReducedMotion(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)
}
