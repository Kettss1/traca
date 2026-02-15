'use client'

import { motion } from 'framer-motion'
import { Book } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface IntroSlideProps {
  year: number
}

export function IntroSlide({ year }: IntroSlideProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-8">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-fit rounded-full bg-white/10 p-6 backdrop-blur-sm"
      >
        <Book className="h-16 w-16 text-white" weight="fill" />
      </motion.div>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <h1 className="text-5xl font-bold">Sua Retrospectiva</h1>
        <p className="mt-2 text-6xl font-black text-green-light">{year}</p>
      </motion.div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.5 }}
        className="text-lg text-white/80"
      >
        Vamos relembrar sua jornada literária neste ano?
      </motion.p>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
        className="text-sm text-white/60"
      >
        Toque para continuar
      </motion.p>
    </div>
  )
}
