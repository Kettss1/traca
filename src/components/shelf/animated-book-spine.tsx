'use client'

import { motion, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { spineHeight, spinePalette, spineWidth } from './spine-style'
import { SpineFace } from './spine-face'

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
      <SpineFace title={title} author={showAuthor ? author : undefined} width={width} palette={palette} />
    </motion.button>
  )
}
