'use client'

import { motion } from 'framer-motion'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface IntroSlideProps {
  year: number
}

export function IntroSlide({ year }: IntroSlideProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-6">
      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.4 }}
        className="text-lg tracking-wide text-white/80"
      >
        Sua retrospectiva
      </motion.p>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.92 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.3, duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
        className="font-fraunces text-[7rem] leading-none font-semibold text-[#f3d9a4] sm:text-[10rem]"
      >
        {year}
      </motion.p>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 12 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.4 }}
        className="text-xl text-white/90"
      >
        Vamos relembrar sua jornada literária neste ano?
      </motion.p>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.9, duration: 0.4 }}
        className="text-sm text-white/60"
      >
        Toque ou use as setas para avançar
      </motion.p>
    </div>
  )
}
