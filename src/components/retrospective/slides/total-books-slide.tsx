'use client'

import { motion } from 'framer-motion'
import { Books, FileText } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface TotalBooksSlideProps {
  totalBooks: number
  totalPages: number
}

export function TotalBooksSlide({ totalBooks, totalPages }: TotalBooksSlideProps) {
  const reducedMotion = useReducedMotion()

  return (
    <div className="space-y-8">
      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.5 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="mx-auto w-fit rounded-full bg-white/10 p-4 backdrop-blur-sm"
      >
        <Books className="h-12 w-12 text-white" weight="fill" />
      </motion.div>

      <motion.p
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.5 }}
        className="text-lg text-white/80"
      >
        Você finalizou
      </motion.p>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.8 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, scale: 1 }}
        transition={{ delay: 0.5, duration: 0.5, type: 'spring' }}
      >
        <p className="text-8xl sm:text-9xl font-fraunces font-semibold text-[#f3d9a4]">{totalBooks}</p>
        <p className="text-2xl font-medium">{totalBooks === 1 ? 'livro' : 'livros'}</p>
      </motion.div>

      <motion.div
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.8, duration: 0.5 }}
        className="flex items-center justify-center gap-2 text-white/70"
      >
        <FileText className="h-5 w-5" />
        <span>
          {totalPages.toLocaleString('pt-BR')} páginas lidas
        </span>
      </motion.div>

      {totalBooks >= 12 && (
        <motion.p
          initial={reducedMotion ? { opacity: 0 } : { opacity: 0 }}
          animate={reducedMotion ? { opacity: 1 } : { opacity: 1 }}
          transition={{ delay: 1, duration: 0.5 }}
          className="text-sm text-[#f3d9a4]"
        >
          Isso é mais de 1 livro por mês! Incrível!
        </motion.p>
      )}
    </div>
  )
}
