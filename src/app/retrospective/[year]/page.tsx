'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AnimatePresence, motion } from 'framer-motion'
import { CaretLeft, CaretRight, X, ShareNetwork } from '@phosphor-icons/react'
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
import { cn } from '@/lib/utils'
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
      <div className="flex h-screen items-center justify-center bg-gradient-to-br from-green-deep to-brown">
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
      <div className="flex h-screen flex-col items-center justify-center bg-gradient-to-br from-green-deep to-brown p-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white"
        >
          <h1 className="text-3xl font-bold mb-4">Nenhum dado encontrado</h1>
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
    <div className="relative h-screen w-full overflow-hidden bg-gradient-to-br from-green-deep via-green-deep to-brown">
      {/* Close button */}
      <button
        onClick={() => router.push('/stats')}
        className="absolute left-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <X className="h-6 w-6" />
      </button>

      {/* Share button */}
      <button
        onClick={() => {
          // TODO: Implement share functionality
        }}
        className="absolute right-4 top-4 z-50 rounded-full bg-white/10 p-2 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
      >
        <ShareNetwork className="h-6 w-6" />
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
          className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <CaretLeft className="h-6 w-6" />
        </button>
      )}
      {currentSlide < slides.length - 1 && (
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm hover:bg-white/20 transition-colors"
        >
          <CaretRight className="h-6 w-6" />
        </button>
      )}

      {/* Progress dots */}
      <div className="absolute bottom-8 left-1/2 z-50 flex -translate-x-1/2 gap-2">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            onClick={() => goToSlide(index)}
            className={cn(
              'h-2 rounded-full transition-all',
              index === currentSlide
                ? 'w-8 bg-white'
                : 'w-2 bg-white/40 hover:bg-white/60'
            )}
          />
        ))}
      </div>

      {/* Click areas for navigation */}
      <div className="absolute inset-0 flex">
        <div className="w-1/3 cursor-pointer" onClick={prevSlide} />
        <div className="w-1/3" />
        <div className="w-1/3 cursor-pointer" onClick={nextSlide} />
      </div>
    </div>
  )
}
