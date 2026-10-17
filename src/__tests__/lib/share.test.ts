import { describe, it, expect, vi, afterEach } from 'vitest'
import { shareOrCopy } from '@/lib/share'

const input = { title: 'Traça', text: 'Marina terminou de ler Dom Casmurro', url: 'https://x.test/profile/marina' }

function setNavigator(props: Record<string, unknown>) {
  for (const [key, value] of Object.entries(props)) {
    Object.defineProperty(navigator, key, { value, configurable: true, writable: true })
  }
}

afterEach(() => {
  setNavigator({ share: undefined, canShare: undefined, clipboard: undefined })
})

describe('shareOrCopy', () => {
  it('usa o compartilhamento nativo quando disponível', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    setNavigator({ share })
    expect(await shareOrCopy(input)).toBe('shared')
    expect(share).toHaveBeenCalledWith({ title: input.title, text: input.text, url: input.url })
  })

  it('trata fechar a folha de compartilhamento como cancelado, sem copiar', async () => {
    const writeText = vi.fn()
    setNavigator({
      share: vi.fn().mockRejectedValue(new DOMException('cancel', 'AbortError')),
      clipboard: { writeText },
    })
    expect(await shareOrCopy(input)).toBe('cancelled')
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copia o link quando não há Web Share', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    setNavigator({ clipboard: { writeText } })
    expect(await shareOrCopy(input)).toBe('copied')
    expect(writeText).toHaveBeenCalledWith(input.url)
  })

  it('anexa arquivos só quando o navegador aceita', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const file = new File(['x'], 'a.png', { type: 'image/png' })
    setNavigator({ share, canShare: () => true })
    await shareOrCopy({ ...input, files: [file] })
    expect(share).toHaveBeenCalledWith(expect.objectContaining({ files: [file] }))
  })

  it('devolve falha quando nem compartilhar nem copiar funciona', async () => {
    setNavigator({ clipboard: { writeText: vi.fn().mockRejectedValue(new Error('negado')) } })
    expect(await shareOrCopy(input)).toBe('failed')
  })
})
