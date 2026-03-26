import { describe, it, expect } from 'vitest'
import { shelfThemes, getShelfTheme } from '@/lib/themes'

describe('shelfThemes', () => {
  it('tem pelo menos um tema', () => {
    expect(shelfThemes.length).toBeGreaterThan(0)
  })

  it('tem exatamente um tema default', () => {
    const defaults = shelfThemes.filter((t) => t.isDefault)
    expect(defaults).toHaveLength(1)
  })

  it('todos os temas têm ids únicos', () => {
    const ids = shelfThemes.map((t) => t.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('todos os temas têm campos obrigatórios', () => {
    for (const theme of shelfThemes) {
      expect(theme.id).toBeTruthy()
      expect(theme.name).toBeTruthy()
      expect(theme.shelfBoard).toBeTruthy()
      expect(theme.shelfBack).toBeTruthy()
      expect(theme.textColor).toBeTruthy()
    }
  })
})

describe('getShelfTheme', () => {
  it('retorna o tema correto pelo id', () => {
    const theme = getShelfTheme('dark-wood')
    expect(theme.id).toBe('dark-wood')
    expect(theme.name).toBe('Madeira Escura')
  })

  it('retorna tema default para id inválido', () => {
    const theme = getShelfTheme('non-existent')
    expect(theme.id).toBe('classic-wood')
  })

  it('retorna tema default para null', () => {
    const theme = getShelfTheme(null)
    expect(theme.id).toBe('classic-wood')
  })

  it('retorna tema default para undefined', () => {
    const theme = getShelfTheme(undefined)
    expect(theme.id).toBe('classic-wood')
  })
})
