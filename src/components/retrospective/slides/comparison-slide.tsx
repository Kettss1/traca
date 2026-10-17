'use client'

import { motion } from 'framer-motion'
import { ArrowUp, ArrowDown, Equals } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ComparisonSlideProps {
  comparison: {
    booksDiff: number
    pagesDiff: number
  }
  year: number
}

export function ComparisonSlide({ comparison, year }: ComparisonSlideProps) {
  const reducedMotion = useReducedMotion()

  const booksUp = comparison.booksDiff > 0
  const booksDown = comparison.booksDiff < 0
  const pagesUp = comparison.pagesDiff > 0
  const pagesDown = comparison.pagesDiff < 0

  return (
    <div className="space-y-6">
      <motion.h2
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="font-fraunces text-3xl font-semibold"
      >
        Comparado com {year - 1}
      </motion.h2>

      <div className="space-y-4">
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -30 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex items-center justify-between rounded-xl bg-white/10 p-4 backdrop-blur-sm"
        >
          <span className="text-lg">Livros</span>
          <div className="flex items-center gap-2">
            {booksUp ? (
              <ArrowUp className="h-6 w-6 text-[#f3d9a4]" weight="bold" />
            ) : booksDown ? (
              <ArrowDown className="h-6 w-6 text-red-400" weight="bold" />
            ) : (
              <Equals className="h-6 w-6 text-white/60" weight="bold" />
            )}
            <span
              className={`text-2xl font-bold ${
                booksUp ? 'text-[#f3d9a4]' : booksDown ? 'text-red-400' : 'text-white/60'
              }`}
            >
              {comparison.booksDiff > 0 ? '+' : ''}
              {comparison.booksDiff}
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 30 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="flex items-center justify-between rounded-xl bg-white/10 p-4 backdrop-blur-sm"
        >
          <span className="text-lg">Páginas</span>
          <div className="flex items-center gap-2">
            {pagesUp ? (
              <ArrowUp className="h-6 w-6 text-[#f3d9a4]" weight="bold" />
            ) : pagesDown ? (
              <ArrowDown className="h-6 w-6 text-red-400" weight="bold" />
            ) : (
              <Equals className="h-6 w-6 text-white/60" weight="bold" />
            )}
            <span
              className={`text-2xl font-bold ${
                pagesUp ? 'text-[#f3d9a4]' : pagesDown ? 'text-red-400' : 'text-white/60'
              }`}
            >
              {comparison.pagesDiff > 0 ? '+' : ''}
              {comparison.pagesDiff.toLocaleString('pt-BR')}
            </span>
          </div>
        </motion.div>
      </div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="text-white/70"
      >
        {booksUp
          ? 'Você superou o ano anterior. Parabéns!'
          : booksDown
            ? 'Um ano diferente, mas igualmente rico em histórias.'
            : 'Consistência é a chave!'}
      </motion.p>
    </div>
  )
}
