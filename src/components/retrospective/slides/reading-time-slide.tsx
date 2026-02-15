'use client'

import { motion } from 'framer-motion'
import { Clock, CurrencyDollar } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface ReadingTimeSlideProps {
  totalHours: number
  totalSpent: number
}

export function ReadingTimeSlide({ totalHours, totalSpent }: ReadingTimeSlideProps) {
  const reducedMotion = useReducedMotion()

  const days = Math.floor(totalHours / 24)
  const remainingHours = totalHours % 24

  return (
    <div className="space-y-8">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-fit rounded-full bg-white/10 p-4 backdrop-blur-sm"
      >
        <Clock className="h-12 w-12 text-white" weight="fill" />
      </motion.div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-white/80"
      >
        Você dedicou aproximadamente
      </motion.p>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
      >
        <p className="text-7xl font-black text-green-light">{totalHours}h</p>
        <p className="text-xl font-medium">de leitura</p>
      </motion.div>

      {days >= 1 && (
        <motion.p
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="text-white/70"
        >
          Isso equivale a {days} dia{days > 1 ? 's' : ''}
          {remainingHours > 0 ? ` e ${remainingHours} hora${remainingHours > 1 ? 's' : ''}` : ''}{' '}
          imerso em histórias!
        </motion.p>
      )}

      {totalSpent > 0 && (
        <motion.div
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          transition={{ delay: 0.9, duration: 0.5 }}
          className="flex items-center justify-center gap-2 rounded-lg bg-white/10 px-4 py-3 text-white/80"
        >
          <CurrencyDollar className="h-5 w-5" />
          <span>
            Investimento em livros:{' '}
            <strong className="text-white">
              R$ {totalSpent.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </strong>
          </span>
        </motion.div>
      )}
    </div>
  )
}
