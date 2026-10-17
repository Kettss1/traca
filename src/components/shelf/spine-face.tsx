import {
  SPINE_TITLE_INSET,
  SPINE_TITLE_LINE,
  fitSpineTitle,
  spineTitleColumns,
  type SpinePalette,
} from './spine-style'
import { SpineCover } from './spine-cover'

interface SpineFaceProps {
  title: string
  width: number
  height: number
  palette: SpinePalette
  /** capa do livro; quando existe, vira a textura da lombada */
  coverUrl?: string | null
}

/** Conteúdo visual da lombada — sem interação, usado na estante, no perfil e na landing. */
export function SpineFace({ title, width, height, palette, coverUrl }: SpineFaceProps) {
  const columns = spineTitleColumns(width)
  const fittedTitle = fitSpineTitle(title, width, height)
  // sobre a capa desfocada o título precisa de sombra para continuar legível
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

      {/* faixas decorativas na cor secundária da capa, espelhadas em cima e embaixo */}
      <span aria-hidden className="absolute inset-x-0 top-2.5 h-[3px]" style={{ backgroundColor: palette.band }} />
      <span aria-hidden className="absolute inset-x-0 top-[17px] h-px opacity-70" style={{ backgroundColor: palette.band }} />
      <span aria-hidden className="absolute inset-x-0 bottom-[17px] h-px opacity-70" style={{ backgroundColor: palette.band }} />
      <span aria-hidden className="absolute inset-x-0 bottom-2.5 h-[3px]" style={{ backgroundColor: palette.band }} />

      {/* título centralizado na lombada, de baixo para cima como nas edições brasileiras */}
      <span
        aria-hidden
        className="absolute inset-x-0 flex items-center justify-center overflow-hidden"
        style={{ top: SPINE_TITLE_INSET, bottom: SPINE_TITLE_INSET }}
      >
        <span
          className="font-fraunces overflow-hidden text-center text-[10.5px] font-semibold"
          style={{
            color: palette.text,
            textShadow,
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            lineHeight: `${SPINE_TITLE_LINE}px`,
            // só colunas inteiras: nunca uma linha cortada pela metade
            width: columns * SPINE_TITLE_LINE,
            maxHeight: '100%',
          }}
        >
          {fittedTitle}
        </span>
      </span>
    </>
  )
}
