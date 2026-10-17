export type ShareOutcome = 'shared' | 'copied' | 'cancelled' | 'failed'

interface ShareInput {
  title: string
  text: string
  url: string
  files?: File[]
}

/**
 * Usa o compartilhamento nativo quando existe (celular, Safari) e cai para
 * copiar o link nos navegadores de desktop que não têm Web Share.
 */
export async function shareOrCopy({ title, text, url, files }: ShareInput): Promise<ShareOutcome> {
  const data: ShareData = { title, text, url }
  if (files?.length && typeof navigator.canShare === 'function' && navigator.canShare({ files })) {
    data.files = files
  }

  if (typeof navigator.share === 'function') {
    try {
      await navigator.share(data)
      return 'shared'
    } catch (error) {
      // fechar a folha de compartilhamento não é erro
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
    }
  }

  try {
    await navigator.clipboard.writeText(url)
    return 'copied'
  } catch {
    return 'failed'
  }
}

/** Baixa um blob como arquivo (fallback quando não dá para compartilhar imagem). */
export function downloadBlob(blob: Blob, filename: string) {
  const href = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = href
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  URL.revokeObjectURL(href)
}
