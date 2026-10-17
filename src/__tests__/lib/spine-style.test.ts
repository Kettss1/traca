import { describe, it, expect } from 'vitest'
import { fitSpineTitle, packIntoRows, spineHeight, spinePalette, spineWidth, SPINE_GAP } from '@/components/shelf/spine-style'

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

describe('fitSpineTitle', () => {
  it('mantém títulos que cabem', () => {
    expect(fitSpineTitle('Duna', 30, 140)).toBe('Duna')
    expect(fitSpineTitle('Cem Anos de Solidão', 50, 150)).toBe('Cem Anos de Solidão')
  })

  it('corta títulos longos em fim de palavra com reticências', () => {
    const fitted = fitSpineTitle('Harry Potter e a Pedra Filosofal', 30, 140)
    expect(fitted.endsWith('…')).toBe(true)
    expect(fitted.length).toBeLessThan('Harry Potter e a Pedra Filosofal'.length)
    expect(fitted).not.toMatch(/\s…$/)
    expect('Harry Potter e a Pedra Filosofal'.startsWith(fitted.slice(0, -1))).toBe(true)
  })

  it('lombada estreita (uma coluna) aceita menos texto que a larga', () => {
    const title = 'Memórias Póstumas de Brás Cubas'
    expect(fitSpineTitle(title, 24, 140).length).toBeLessThan(fitSpineTitle(title, 50, 140).length)
  })

  it('não deixa pontuação pendurada antes das reticências', () => {
    expect(fitSpineTitle('Grande Sertão: Veredas e outras histórias longas', 24, 130)).not.toMatch(/[:,]…$/)
  })

  it('nunca corta no meio de uma palavra quando há espaço antes', () => {
    const fitted = fitSpineTitle('A Paixão Segundo G.H. edição comentada e ampliada', 24, 130)
    const words = 'A Paixão Segundo G.H. edição comentada e ampliada'.split(' ')
    fitted.slice(0, -1).split(' ').forEach((w) => expect(words).toContain(w))
  })

  it('normaliza espaços', () => {
    expect(fitSpineTitle('  O   Hobbit ', 30, 140)).toBe('O Hobbit')
  })
})
