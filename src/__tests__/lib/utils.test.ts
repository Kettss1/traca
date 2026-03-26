import { describe, it, expect } from 'vitest'
import { cn, validateEmail, formatDate, formatCurrency } from '@/lib/utils'

describe('cn', () => {
  it('combina classes simples', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('resolve conflitos do Tailwind', () => {
    expect(cn('p-4', 'p-2')).toBe('p-2')
  })

  it('ignora valores falsy', () => {
    expect(cn('foo', false && 'bar', undefined, null, 'baz')).toBe('foo baz')
  })

  it('suporta condicionais com clsx', () => {
    expect(cn('base', { active: true, disabled: false })).toBe('base active')
  })
})

describe('validateEmail', () => {
  it('aceita email válido', () => {
    expect(validateEmail('user@example.com')).toBe(true)
  })

  it('aceita email com subdomínio', () => {
    expect(validateEmail('user@mail.example.com')).toBe(true)
  })

  it('rejeita email sem @', () => {
    expect(validateEmail('userexample.com')).toBe(false)
  })

  it('rejeita email sem domínio', () => {
    expect(validateEmail('user@')).toBe(false)
  })

  it('rejeita email sem username', () => {
    expect(validateEmail('@example.com')).toBe(false)
  })

  it('rejeita email com espaços', () => {
    expect(validateEmail('user @example.com')).toBe(false)
  })

  it('rejeita string vazia', () => {
    expect(validateEmail('')).toBe(false)
  })
})

describe('formatDate', () => {
  it('formata data em pt-BR por padrão', () => {
    const date = new Date(2025, 0, 15) // 15 de janeiro de 2025
    const result = formatDate(date)
    expect(result).toContain('15')
    expect(result).toContain('janeiro')
    expect(result).toContain('2025')
  })

  it('formata data com locale customizado', () => {
    const date = new Date(2025, 0, 15)
    const result = formatDate(date, 'en-US')
    expect(result).toContain('January')
    expect(result).toContain('15')
    expect(result).toContain('2025')
  })
})

describe('formatCurrency', () => {
  it('formata em BRL por padrão', () => {
    const result = formatCurrency(42.5)
    expect(result).toMatch(/R\$\s*42,50/)
  })

  it('formata zero', () => {
    const result = formatCurrency(0)
    expect(result).toMatch(/R\$\s*0,00/)
  })

  it('formata valores grandes', () => {
    const result = formatCurrency(1234.99)
    expect(result).toContain('1.234,99')
  })

  it('formata em USD quando especificado', () => {
    const result = formatCurrency(42.5, 'en-US', 'USD')
    expect(result).toContain('$42.50')
  })
})
