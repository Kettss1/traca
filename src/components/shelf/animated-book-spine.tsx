'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spineHeight, spinePalette, spineWidth } from './spine-style'

const TITLE_LINE = 11.5

interface AnimatedBookSpineProps {
  layoutId?: string
  title: string
  authors: string[]
  colorPrimary?: string
  colorSecondary?: string
  pageCount?: number
  onClick?: () => void
  isDraggable?: boolean
  className?: string
}

export function AnimatedBookSpine({
  layoutId,
  title,
  authors,
  colorPrimary,
  colorSecondary,
  pageCount,
  onClick,
  isDraggable,
  className,
}: AnimatedBookSpineProps) {
  const reduceMotion = useReducedMotion()
  const width = spineWidth(pageCount)
  const height = spineHeight(title)
  const palette = spinePalette(colorPrimary, colorSecondary)
  const author = authors[0]?.split(' ').slice(-1)[0]
  // sobrenomes curtos cabem inteiros no pé da lombada; os longos ficam só no título/tooltip
  const showAuthor = !!author && author.length <= 7 && width >= 26 && height >= 140

  return (
    <motion.button
      type="button"
      layoutId={layoutId}
      onClick={onClick}
      className={cn(
        'group relative block shrink-0 overflow-hidden rounded-[3px] will-change-transform',
        'focus-visible:ring-2 focus-visible:ring-[#f3d9a4] focus-visible:ring-offset-2 focus-visible:ring-offset-[#3b2c1f] focus-visible:outline-none',
        isDraggable && 'cursor-grab active:cursor-grabbing',
        className
      )}
      style={{
        width,
        height,
        backgroundColor: palette.background,
        boxShadow: '1px 0 0 rgb(0 0 0 / 0.25), 3px 2px 6px rgb(0 0 0 / 0.35)',
      }}
      whileHover={reduceMotion ? undefined : { y: -8, transition: { duration: 0.2, ease: [0.32, 0.72, 0, 1] } }}
      whileTap={reduceMotion ? undefined : { scale: 0.98 }}
      aria-label={`${title}${authors.length ? `, de ${authors.join(', ')}` : ''}`}
      title={`${title}${authors.length ? ` — ${authors.join(', ')}` : ''}`}
    >
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
      <span aria-hidden className="absolute inset-x-0 top-2.5 h-[3px]" style={{ backgroundColor: palette.band }} />
      <span aria-hidden className="absolute inset-x-0 top-[17px] h-px opacity-70" style={{ backgroundColor: palette.band }} />
      <span aria-hidden className="absolute inset-x-0 bottom-3 h-[3px]" style={{ backgroundColor: palette.band }} />

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
        <span aria-hidden className="absolute inset-x-0 bottom-[19px] flex h-9 items-center justify-center overflow-hidden">
          <span
            className="text-[8px] leading-none font-semibold tracking-wide whitespace-nowrap uppercase opacity-75"
            style={{ color: palette.text, writingMode: 'vertical-rl', transform: 'rotate(180deg)' }}
          >
            {author}
          </span>
        </span>
      )}
    </motion.button>
  )
}
