import type { SpinePalette } from './spine-style'
import { SpineCover } from './spine-cover'

const TITLE_LINE = 11.5

interface SpineFaceProps {
  title: string
  /** sobrenome já filtrado (curto o bastante para caber) */
  author?: string
  width: number
  palette: SpinePalette
  /** capa do livro; quando existe, vira a textura da lombada */
  coverUrl?: string | null
}

/** Conteúdo visual da lombada — sem interação, usado na estante e na landing. */
export function SpineFace({ title, author, width, palette, coverUrl }: SpineFaceProps) {
  const showAuthor = !!author
  // sobre foto o título precisa de sombra para continuar legível
  const textShadow = coverUrl
    ? palette.isLight
      ? '0 0 3px rgb(255 255 255 / 0.85), 0 0 1px rgb(255 255 255 / 0.9)'
      : '0 1px 3px rgb(0 0 0 / 0.8), 0 0 1px rgb(0 0 0 / 0.9)'
    : undefined
  return (
    <>
      {coverUrl && <SpineCover src={coverUrl} tint={palette.background} />}

      {/* volume: luz na borda esquerda, sombra na direita */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgb(255 255 255 / 0.22) 0, rgb(255 255 255 / 0.06) 18%, transparent 45%, rgb(0 0 0 / 0.08) 75%, rgb(0 0 0 / 0.28) 100%)',
        }}
      />

      {/* faixas decorativas na cor secundária da capa */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-2.5 h-[3px]"
        style={{ backgroundColor: palette.band }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 top-[17px] h-px opacity-70"
        style={{ backgroundColor: palette.band }}
      />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-3 h-[3px]"
        style={{ backgroundColor: palette.band }}
      />

      {/* título, de baixo para cima como nas lombadas brasileiras */}
      <span
        aria-hidden
        className="absolute inset-x-0 top-6 flex items-center justify-center overflow-hidden"
        style={{ bottom: showAuthor ? 58 : 22 }}
      >
        <span
          className="font-fraunces overflow-hidden text-center text-[10.5px] font-semibold"
          style={{
            color: palette.text,
            textShadow,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            lineHeight: `${TITLE_LINE}px`,
            // só cabem colunas inteiras: evita uma linha cortada pela metade
            width: Math.max(1, Math.floor((width - 4) / TITLE_LINE)) * TITLE_LINE,
            maxHeight: '100%',
          }}
        >
          {title}
        </span>
      </span>

      {/* sobrenome do autor no pé da lombada */}
      {showAuthor && (
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-[19px] flex h-9 items-center justify-center overflow-hidden"
        >
          <span
            className="text-[8px] leading-none font-semibold tracking-wide whitespace-nowrap uppercase opacity-75"
            style={{
              color: palette.text,
              textShadow,
              writingMode: 'vertical-rl',
              transform: 'rotate(180deg)',
            }}
          >
            {author}
          </span>
        </span>
      )}
    </>
  )
}
