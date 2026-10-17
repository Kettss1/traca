/**
 * Medidas e cores das lombadas. Ficam fora do componente para que a prateleira
 * consiga calcular quantos livros cabem em cada linha antes de renderizar.
 */

export const SPINE_GAP = 3
export const SHELF_INNER_HEIGHT = 168

const FALLBACK_COLOR = '#7a5c44'

/** Largura proporcional ao número de páginas (livro grosso = lombada larga). */
export function spineWidth(pageCount?: number | null): number {
  if (!pageCount) return 34
  return Math.round(Math.min(Math.max(pageCount / 9, 24), 58))
}

/** Altura estável por título, para a estante não parecer uma fileira de clones. */
export function spineHeight(seed: string): number {
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return 128 + (Math.abs(hash) % 31)
}

function parseHex(color: string): [number, number, number] | null {
  const hex = color.trim().replace('#', '')
  const full = hex.length === 3 ? hex.split('').map((c) => c + c).join('') : hex
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [0, 2, 4].map((i) => parseInt(full.slice(i, i + 2), 16)) as [number, number, number]
}

function luminance([r, g, b]: [number, number, number]): number {
  return (0.299 * r + 0.587 * g + 0.114 * b) / 255
}

export interface SpinePalette {
  background: string
  band: string
  text: string
  isLight: boolean
}

export function spinePalette(primary?: string | null, secondary?: string | null): SpinePalette {
  const background = primary && parseHex(primary) ? primary : FALLBACK_COLOR
  const bg = parseHex(background) ?? [122, 92, 68]
  const isLight = luminance(bg) > 0.6
  const text = isLight ? '#1f1a14' : '#fbf4e8'

  // A faixa usa a cor secundária da capa; se ela for parecida demais com a primária,
  // cai para a cor do texto translúcida para continuar visível.
  const sec = secondary ? parseHex(secondary) : null
  const distance = sec ? Math.abs(luminance(sec) - luminance(bg)) : 0
  const band = sec && distance > 0.12 ? (secondary as string) : isLight ? 'rgb(31 26 20 / 0.45)' : 'rgb(251 244 232 / 0.55)'

  return { background, band, text, isLight }
}

/** Distribui os livros em linhas pela largura disponível, mantendo a ordem. */
export function packIntoRows<T>(
  items: T[],
  availableWidth: number,
  widthOf: (item: T) => number,
  fallbackPerRow = 12
): T[][] {
  if (items.length === 0) return [[]]
  if (availableWidth <= 0) {
    const rows: T[][] = []
    for (let i = 0; i < items.length; i += fallbackPerRow) rows.push(items.slice(i, i + fallbackPerRow))
    return rows
  }

  const rows: T[][] = [[]]
  let used = 0
  for (const item of items) {
    const w = widthOf(item) + SPINE_GAP
    const row = rows[rows.length - 1]
    if (row.length > 0 && used + w > availableWidth) {
      rows.push([item])
      used = w
    } else {
      row.push(item)
      used += w
    }
  }
  return rows
}
