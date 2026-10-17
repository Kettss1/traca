import { describe, it, expect } from 'vitest'
import { packIntoRows, spineHeight, spinePalette, spineWidth, SPINE_GAP } from '@/components/shelf/spine-style'

describe('spineWidth', () => {
  it('cresce com o número de páginas dentro dos limites', () => {
    expect(spineWidth(90)).toBe(24)
    expect(spineWidth(300)).toBe(33)
    expect(spineWidth(2000)).toBe(58)
    expect(spineWidth(null)).toBe(34)
  })
})

describe('spineHeight', () => {
  it('é estável e fica entre 128 e 158', () => {
    const h = spineHeight('Dom Casmurro')
    expect(h).toBe(spineHeight('Dom Casmurro'))
    for (const t of ['A', 'Duna', 'Grande Sertão: Veredas', '1984']) {
      expect(spineHeight(t)).toBeGreaterThanOrEqual(128)
      expect(spineHeight(t)).toBeLessThanOrEqual(158)
    }
  })
})

describe('spinePalette', () => {
  it('usa texto escuro em capa clara e claro em capa escura', () => {
    expect(spinePalette('#f5f0e6').text).toBe('#1f1a14')
    expect(spinePalette('#1e293b').text).toBe('#fbf4e8')
  })

  it('usa a secundária na faixa quando contrasta, senão cai no texto translúcido', () => {
    expect(spinePalette('#1e293b', '#f5c542').band).toBe('#f5c542')
    expect(spinePalette('#1e293b', '#24304a').band).toMatch(/^rgb/)
  })

  it('tem fallback para cor inválida', () => {
    expect(spinePalette('lab(50 10 10)').background).toBe('#7a5c44')
  })
})

describe('packIntoRows', () => {
  it('quebra a linha quando a largura acaba e mantém a ordem', () => {
    const items = [40, 40, 40, 40, 40]
    const rows = packIntoRows(items, 3 * (40 + SPINE_GAP), (w) => w)
    expect(rows).toEqual([[40, 40, 40], [40, 40]])
  })

  it('usa quantidade fixa antes de medir', () => {
    const rows = packIntoRows([1, 2, 3, 4, 5], 0, () => 10, 2)
    expect(rows).toEqual([[1, 2], [3, 4], [5]])
  })

  it('devolve uma linha vazia sem livros', () => {
    expect(packIntoRows([], 500, () => 10)).toEqual([[]])
  })
})
