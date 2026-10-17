'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretLeft, CaretRight, X } from '@phosphor-icons/react'
import { RetrospectiveSlide } from '@/components/retrospective/retrospective-slide'
import { IntroSlide } from '@/components/retrospective/slides/intro-slide'
import { TotalBooksSlide } from '@/components/retrospective/slides/total-books-slide'
import { ReadingTimeSlide } from '@/components/retrospective/slides/reading-time-slide'
import { FastestSlowsetSlide } from '@/components/retrospective/slides/fastest-slowest-slide'
import { TopAuthorsSlide } from '@/components/retrospective/slides/top-authors-slide'
import { MonthlySlide } from '@/components/retrospective/slides/monthly-slide'
import { FavoriteQuoteSlide } from '@/components/retrospective/slides/favorite-quote-slide'
import { ComparisonSlide } from '@/components/retrospective/slides/comparison-slide'
import { FinalSlide } from '@/components/retrospective/slides/final-slide'
import type { RetrospectiveData } from '@/lib/services/retrospective'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

export default function RetrospectivePage() {
  const params = useParams()
  const router = useRouter()
  const year = parseInt(params.year as string)
  const reducedMotion = useReducedMotion()

  const [data, setData] = useState<RetrospectiveData | null>(null)
  const [loading, setLoading] = useState(true)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [direction, setDirection] = useState(0)

  useEffect(() => {
    async function fetchData() {
      try {
        const response = await fetch(`/api/retrospective/${year}`)
        if (response.ok) {
          const result = await response.json()
          setData(result)
        }
      } catch (error) {
        console.error('Failed to fetch retrospective data:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [year])

  const slides = data
    ? [
        { id: 'intro', component: <IntroSlide year={year} /> },
        {
          id: 'total-books',
          component: <TotalBooksSlide totalBooks={data.totalBooks} totalPages={data.totalPages} />,
        },
        {
          id: 'reading-time',
          component: (
            <ReadingTimeSlide totalHours={data.totalHours} totalSpent={data.totalSpent} />
          ),
        },
        ...(data.fastestBook || data.slowestBook
          ? [
              {
                id: 'fastest-slowest',
                component: (
                  <FastestSlowsetSlide
                    fastestBook={data.fastestBook}
                    slowestBook={data.slowestBook}
                  />
                ),
              },
            ]
          : []),
        ...(data.topAuthor || data.topCategory
          ? [
              {
                id: 'top-authors',
                component: (
                  <TopAuthorsSlide
                    topAuthor={data.topAuthor}
                    topPublisher={data.topPublisher}
                    topCategory={data.topCategory}
                  />
                ),
              },
            ]
          : []),
        {
          id: 'monthly',
          component: (
            <MonthlySlide
              booksPerMonth={data.booksPerMonth}
              mostProductiveMonth={data.mostProductiveMonth}
            />
          ),
        },
        ...(data.favoriteQuote
          ? [
              {
                id: 'favorite-quote',
                component: <FavoriteQuoteSlide quote={data.favoriteQuote} />,
              },
            ]
          : []),
        ...(data.comparisonToPreviousYear
          ? [
              {
                id: 'comparison',
                component: (
                  <ComparisonSlide
                    comparison={data.comparisonToPreviousYear}
                    year={year}
                  />
                ),
              },
            ]
          : []),
        {
          id: 'final',
          component: (
            <FinalSlide
              year={year}
              totalBooks={data.totalBooks}
              averageRating={data.averageRating}
              longestStreak={data.longestStreak}
            />
          ),
        },
      ]
    : []

  // uma cor chapada por tela, como nos stories
  const SLIDE_COLORS = ['#115e59', '#b9532f', '#2b3445', '#6b3a1f', '#5f4a85', '#1f5a4f', '#7a2f1d', '#36557a', '#115e59']
  const slideColor = (index: number) =>
    index === slides.length - 1 ? SLIDE_COLORS[SLIDE_COLORS.length - 1] : SLIDE_COLORS[index % (SLIDE_COLORS.length - 1)]

  function goToSlide(index: number) {
    if (index < 0 || index >= slides.length) return
    setDirection(index > currentSlide ? 1 : -1)
    setCurrentSlide(index)
  }

  function nextSlide() {
    if (currentSlide < slides.length - 1) {
      goToSlide(currentSlide + 1)
    }
  }

  function prevSlide() {
    if (currentSlide > 0) {
      goToSlide(currentSlide - 1)
    }
  }

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        nextSlide()
      } else if (e.key === 'ArrowLeft') {
        prevSlide()
      } else if (e.key === 'Escape') {
        router.push('/stats')
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [currentSlide, slides.length])

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#115e59]">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center text-white"
        >
          <div className="mb-4 h-12 w-12 animate-spin rounded-full border-4 border-white/30 border-t-white mx-auto" />
          <p className="text-lg">Preparando sua retrospectiva...</p>
        </motion.div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex h-screen flex-col items-center justify-center bg-[#115e59] p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="font-fraunces mb-4 text-3xl font-semibold">Nenhum dado encontrado</h1>
          <p className="text-white/80 mb-6">
            Você ainda não finalizou nenhum livro em {year}.
          </p>
          <button
            onClick={() => router.push('/stats')}
            className="rounded-full bg-white px-6 py-3 font-medium text-green-deep hover:bg-white/90 transition-colors"
          >
            Voltar para Estatísticas
          </button>
        </motion.div>
      </div>
    )
  }

  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: number) => ({
      x: direction > 0 ? '-100%' : '100%',
      opacity: 0,
    }),
  }

  return (
    <motion.div
      className="relative h-screen w-full overflow-hidden"
      animate={{ backgroundColor: slideColor(currentSlide) }}
      initial={false}
      transition={{ duration: reducedMotion ? 0 : 0.4, ease: [0.32, 0.72, 0, 1] }}
    >
      {/* Barras de progresso estilo stories */}
      <div className="absolute inset-x-4 top-4 z-50 flex gap-1.5" role="tablist" aria-label="Telas da retrospectiva">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            role="tab"
            aria-selected={index === currentSlide}
            aria-label={`Tela ${index + 1} de ${slides.length}`}
            onClick={() => goToSlide(index)}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/25"
          >
            <span
              className="block h-full rounded-full bg-white transition-[width] duration-300"
              style={{ width: index <= currentSlide ? '100%' : '0%' }}
            />
          </button>
        ))}
      </div>

      {/* Fechar */}
      <button
        onClick={() => router.push('/stats')}
        aria-label="Fechar retrospectiva"
        className="absolute top-8 right-4 z-50 rounded-full p-2 text-white/80 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Slides */}
      <AnimatePresence mode="wait" custom={direction}>
        <motion.div
          key={slides[currentSlide].id}
          custom={direction}
          variants={reducedMotion ? undefined : slideVariants}
          initial={reducedMotion ? { opacity: 0 } : 'enter'}
          animate={reducedMotion ? { opacity: 1 } : 'center'}
          exit={reducedMotion ? { opacity: 0 } : 'exit'}
          transition={{
            x: { type: 'spring', stiffness: 300, damping: 30 },
            opacity: { duration: 0.2 },
          }}
          className="h-full w-full"
        >
          <RetrospectiveSlide>{slides[currentSlide].component}</RetrospectiveSlide>
        </motion.div>
      </AnimatePresence>

      {/* Navigation arrows */}
      {currentSlide > 0 && (
        <button
          onClick={prevSlide}
          aria-label="Tela anterior"
          className="absolute left-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:block"
        >
          <CaretLeft className="h-6 w-6" />
        </button>
      )}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={nextSlide}
          aria-label="Próxima tela"
          className="absolute right-4 top-1/2 z-50 hidden -translate-y-1/2 rounded-full bg-white/10 p-3 text-white transition-colors hover:bg-white/20 sm:block"
        >
          <CaretRight className="h-6 w-6" />
        </button>
      )}

      {/* Click areas for navigation */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 cursor-pointer" onClick={prevSlide} />
        <div className="w-1/3" />
        <div className="w-1/3 cursor-pointer" onClick={nextSlide} />
      </div>
    </motion.div>
  )
}
