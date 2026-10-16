import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function validateEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function formatDate(date: Date, locale = 'pt-BR') {
  return new Intl.DateTimeFormat(locale, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(date)
}

export function formatCurrency(value: number, locale = 'pt-BR', currency = 'BRL') {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

const QUOTE_CHARS = '"“”\'‘’«»'

/**
 * Separa uma citação salva pelo usuário em texto e autoria.
 * Aceita `"Texto." — Autor`, `Texto — Autor` ou só `"Texto"`; remove aspas externas
 * para que a interface possa colocar as suas sem duplicar.
 */
export function parseQuote(raw: string): { text: string; author: string | null } {
  const trimmed = raw.trim()
  const match = trimmed.match(/^(.*?)\s+[—–-]\s+([^—–-]+)$/)
  const body = match ? match[1] : trimmed
  const author = match ? match[2].trim() : null

  let text = body.trim()
  while (text.length > 1 && QUOTE_CHARS.includes(text[0]) && QUOTE_CHARS.includes(text[text.length - 1])) {
    text = text.slice(1, -1).trim()
  }

  return { text, author: author || null }
}
