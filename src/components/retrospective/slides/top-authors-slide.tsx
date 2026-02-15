'use client'

import { motion } from 'framer-motion'
import { User, Buildings, Tag } from '@phosphor-icons/react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

interface TopAuthorsSlideProps {
  topAuthor: { name: string; count: number } | null
  topPublisher: { name: string; count: number } | null
  topCategory: { name: string; count: number } | null
}

export function TopAuthorsSlide({ topAuthor, topPublisher, topCategory }: TopAuthorsSlideProps) {
  const reducedMotion = useReducedMotion()

  const items = [
    topAuthor && {
      icon: User,
      label: 'Autor favorito',
      value: topAuthor.name,
      count: topAuthor.count,
    },
    topCategory && {
      icon: Tag,
      label: 'Categoria favorita',
      value: topCategory.name,
      count: topCategory.count,
    },
    topPublisher && {
      icon: Buildings,
      label: 'Editora mais lida',
      value: topPublisher.name,
      count: topPublisher.count,
    },
  ].filter(Boolean) as {
    icon: React.ComponentType<{ className?: string; weight?: string }>
    label: string
    value: string
    count: number
  }[]

  return (
    <div className="space-y-6">
      <motion.h2
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 20 }}
        animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="text-2xl font-bold"
      >
        Suas preferências
      </motion.h2>

      <div className="space-y-4">
        {items.map((item, index) => (
          <motion.div
            key={item.label}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 30 }}
            animate={reducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.15, duration: 0.5 }}
            className="rounded-xl bg-white/10 p-4 backdrop-blur-sm"
          >
            <div className="flex items-center gap-3">
              <div className="rounded-full bg-green-light/20 p-2">
                <item.icon className="h-5 w-5 text-green-light" weight="fill" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-xs uppercase tracking-wide text-white/60">{item.label}</p>
                <p className="text-lg font-bold">{item.value}</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-green-light">{item.count}</p>
                <p className="text-xs text-white/60">
                  {item.count === 1 ? 'livro' : 'livros'}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
