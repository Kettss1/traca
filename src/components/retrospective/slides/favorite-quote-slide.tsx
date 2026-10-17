'use client'

import { motion } from 'framer-motion'
import { Quotes } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface FavoriteQuoteSlideProps {
  quote: string
}

export function FavoriteQuoteSlide({ quote }: FavoriteQuoteSlideProps) {
  const reducedMotion = useReducedMotion()

  // Truncate very long quotes
  const displayQuote = quote.length > 300 ? quote.slice(0, 297) + '...' : quote

  return (
    <div className="space-y-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-fit rounded-full bg-white/10 p-4 backdrop-blur-sm"
      >
        <Quotes className="h-10 w-10 text-white" weight="fill" />
      </motion.div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-white/80"
      >
        Uma citação que marcou seu ano
      </motion.p>

      <motion.blockquote
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.6 }}
        className="relative rounded-xl bg-white/10 p-6 backdrop-blur-sm"
      >
        <Quotes className="absolute left-3 top-3 h-6 w-6 text-white/25" weight="fill" />
        <p className="text-xl font-medium italic leading-relaxed">{displayQuote}</p>
        <Quotes
          className="absolute bottom-3 right-3 h-6 w-6 rotate-180 text-white/25"
          weight="fill"
        />
      </motion.blockquote>
    </div>
  )
}
