'use client'

import { motion } from 'framer-motion'
import { Lightning, Hourglass } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface FastestSlowsetSlideProps {
  fastestBook: {
    title: string
    author: string
    days: number
  } | null
  slowestBook: {
    title: string
    author: string
    days: number
  } | null
}

export function FastestSlowsetSlide({ fastestBook, slowestBook }: FastestSlowsetSlideProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-8">
      <motion.h2
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        Seus extremos de leitura
      </motion.h2>

      {fastestBook && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: -50 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="rounded-xl bg-white/10 p-4 text-left backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-green-light">
            <Lightning className="h-5 w-5" weight="fill" />
            <span className="text-sm font-medium uppercase tracking-wide">Mais rápido</span>
          </div>
          <p className="mt-2 text-xl font-bold">{fastestBook.title}</p>
          <p className="text-sm text-white/70">{fastestBook.author}</p>
          <p className="mt-2 text-3xl font-black text-green-light">
            {fastestBook.days} {fastestBook.days === 1 ? 'dia' : 'dias'}
          </p>
        </motion.div>
      )}

      {slowestBook && slowestBook.title !== fastestBook?.title && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, x: 50 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, x: 0 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="rounded-xl bg-white/10 p-4 text-left backdrop-blur-sm"
        >
          <div className="flex items-center gap-2 text-orange-300">
            <Hourglass className="h-5 w-5" weight="fill" />
            <span className="text-sm font-medium uppercase tracking-wide">Mais demorado</span>
          </div>
          <p className="mt-2 text-xl font-bold">{slowestBook.title}</p>
          <p className="text-sm text-white/70">{slowestBook.author}</p>
          <p className="mt-2 text-3xl font-black text-orange-300">
            {slowestBook.days} {slowestBook.days === 1 ? 'dia' : 'dias'}
          </p>
        </motion.div>
      )}

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.5 }}
        className="text-sm text-white/60"
      >
        Cada livro tem seu próprio ritmo!
      </motion.p>
    </div>
  )
}
