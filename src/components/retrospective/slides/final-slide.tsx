'use client'

import { motion } from 'framer-motion'
import { Star, Fire, Confetti } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface FinalSlideProps {
  year: number
  totalBooks: number
  averageRating: number
  longestStreak: number
}

export function FinalSlide({ year, totalBooks, averageRating, longestStreak }: FinalSlideProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5, rotate: -10 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1, rotate: 0 }}
        transition={{ delay: 0.2, duration: 0.5, type: 'spring' }}
        className="mx-auto w-fit"
      >
        <Confetti className="h-16 w-16 text-yellow-400" weight="fill" />
      </motion.div>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h2 className="text-3xl font-bold">Parabéns!</h2>
        <p className="mt-2 text-white/80">
          Que ano incrível de leituras!
        </p>
      </motion.div>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="grid grid-cols-3 gap-3"
      >
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <p className="text-3xl font-black text-green-light">{totalBooks}</p>
          <p className="text-xs text-white/70">livros</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1">
            <Star className="h-5 w-5 text-yellow-400" weight="fill" />
            <p className="text-3xl font-black text-yellow-400">{averageRating.toFixed(1)}</p>
          </div>
          <p className="text-xs text-white/70">média</p>
        </div>
        <div className="rounded-xl bg-white/10 p-3 backdrop-blur-sm">
          <div className="flex items-center justify-center gap-1">
            <Fire className="h-5 w-5 text-orange-400" weight="fill" />
            <p className="text-3xl font-black text-orange-400">{longestStreak}</p>
          </div>
          <p className="text-xs text-white/70">streak</p>
        </div>
      </motion.div>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="pt-4"
      >
        <p className="text-6xl font-black text-green-light">#{year}Traça</p>
      </motion.div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-sm text-white/60"
      >
        Compartilhe sua retrospectiva!
      </motion.p>
    </div>
  )
}
