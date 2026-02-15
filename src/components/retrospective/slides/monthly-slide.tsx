'use client'

import { motion } from 'framer-motion'
import { CalendarBlank, Trophy } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface MonthlySlideProps {
  booksPerMonth: number[]
  mostProductiveMonth: { month: string; count: number } | null
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function MonthlySlide({ booksPerMonth, mostProductiveMonth }: MonthlySlideProps) {
  const reducedMotion = useReducedMotion()
  const maxBooks = Math.max(...booksPerMonth, 1)

  return (
    <div className="space-y-6">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-fit rounded-full bg-white/10 p-4 backdrop-blur-sm"
      >
        <CalendarBlank className="h-10 w-10 text-white" weight="fill" />
      </motion.div>

      <motion.h2
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        Seu ano mês a mês
      </motion.h2>

      {/* Bar chart */}
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="flex items-end justify-center gap-1 h-32"
      >
        {booksPerMonth.map((count, index) => (
          <motion.div
            key={index}
            className="flex flex-col items-center gap-1"
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scaleY: 0 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scaleY: 1 }}
            transition={{ delay: 0.5 + index * 0.05, duration: 0.3 }}
            style={{ transformOrigin: 'bottom' }}
          >
            <div
              className="w-5 rounded-t bg-green-light transition-all"
              style={{
                height: `${Math.max((count / maxBooks) * 80, count > 0 ? 8 : 2)}px`,
                opacity: count === 0 ? 0.3 : 1,
              }}
            />
            <span className="text-[10px] text-white/60">{MONTHS[index]}</span>
          </motion.div>
        ))}
      </motion.div>

      {mostProductiveMonth && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center gap-3 rounded-xl bg-white/10 p-4 backdrop-blur-sm"
        >
          <Trophy className="h-8 w-8 text-yellow-400" weight="fill" />
          <div className="text-left">
            <p className="text-sm text-white/70">Mês mais produtivo</p>
            <p className="text-xl font-bold">
              {mostProductiveMonth.month}{' '}
              <span className="text-green-light">
                ({mostProductiveMonth.count} {mostProductiveMonth.count === 1 ? 'livro' : 'livros'})
              </span>
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}
