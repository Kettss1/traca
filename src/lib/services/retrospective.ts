import { db } from '@/lib/db'

export interface RetrospectiveData {
  year: number
  totalBooks: number
  totalPages: number
  totalHours: number
  totalSpent: number
  averageRating: number
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
  topAuthor: {
    name: string
    count: number
  } | null
  topPublisher: {
    name: string
    count: number
  } | null
  topCategory: {
    name: string
    count: number
  } | null
  longestStreak: number
  mostProductiveMonth: {
    month: string
    count: number
  } | null
  favoriteQuote: string | null
  booksPerMonth: number[]
  comparisonToPreviousYear: {
    booksDiff: number
    pagesDiff: number
  } | null
}

const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export async function getRetrospectiveData(
  userId: string,
  year: number
): Promise<RetrospectiveData | null> {
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  // Get all books finished in the year
  const finishedBooks = await db.userBook.findMany({
    where: {
      userId,
      status: 'READ',
      finishDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    include: {
      book: true,
      annotations: {
        where: { type: 'QUOTE', deletedAt: null },
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  })

  if (finishedBooks.length === 0) {
    return null
  }

  // Basic stats
  const totalBooks = finishedBooks.length
  const totalPages = finishedBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0)
  const estimatedMinutes = (totalPages * 250) / 200
  const totalHours = Math.round(estimatedMinutes / 60)
  const totalSpent = finishedBooks.reduce((sum, ub) => sum + (ub.acquisitionValue || 0), 0)

  const ratedBooks = finishedBooks.filter((ub) => ub.rating !== null)
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / ratedBooks.length
      : 0

  // Fastest and slowest books
  const booksWithReadingTime = finishedBooks
    .filter((ub) => ub.startDate && ub.finishDate)
    .map((ub) => {
      const days = Math.ceil(
        (new Date(ub.finishDate!).getTime() - new Date(ub.startDate!).getTime()) /
          (1000 * 60 * 60 * 24)
      )
      return {
        title: ub.book.title,
        author: ub.book.authors[0] || 'Autor desconhecido',
        days: Math.max(1, days),
      }
    })
    .sort((a, b) => a.days - b.days)

  const fastestBook = booksWithReadingTime[0] || null
  const slowestBook = booksWithReadingTime[booksWithReadingTime.length - 1] || null

  // Top author
  const authorCounts: Record<string, number> = {}
  finishedBooks.forEach((ub) => {
    ub.book.authors.forEach((author) => {
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
  })
  const topAuthorEntry = Object.entries(authorCounts).sort((a, b) => b[1] - a[1])[0]
  const topAuthor = topAuthorEntry ? { name: topAuthorEntry[0], count: topAuthorEntry[1] } : null

  // Top publisher
  const publisherCounts: Record<string, number> = {}
  finishedBooks.forEach((ub) => {
    if (ub.book.publisher) {
      publisherCounts[ub.book.publisher] = (publisherCounts[ub.book.publisher] || 0) + 1
    }
  })
  const topPublisherEntry = Object.entries(publisherCounts).sort((a, b) => b[1] - a[1])[0]
  const topPublisher = topPublisherEntry
    ? { name: topPublisherEntry[0], count: topPublisherEntry[1] }
    : null

  // Top category
  const categoryCounts: Record<string, number> = {}
  finishedBooks.forEach((ub) => {
    ub.book.categories.forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
  })
  const topCategoryEntry = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]
  const topCategory = topCategoryEntry
    ? { name: topCategoryEntry[0], count: topCategoryEntry[1] }
    : null

  // Books per month
  const booksPerMonth = MONTHS.map((_, monthIndex) => {
    return finishedBooks.filter((ub) => {
      const finishDate = ub.finishDate ? new Date(ub.finishDate) : null
      return finishDate && finishDate.getMonth() === monthIndex
    }).length
  })

  // Most productive month
  const maxBooksInMonth = Math.max(...booksPerMonth)
  const mostProductiveMonthIndex = booksPerMonth.indexOf(maxBooksInMonth)
  const mostProductiveMonth =
    maxBooksInMonth > 0
      ? { month: MONTHS[mostProductiveMonthIndex], count: maxBooksInMonth }
      : null

  // Longest reading streak (consecutive days with reading activity)
  // This would require reading logs, for now we'll estimate based on finish dates
  const finishDates = finishedBooks
    .filter((ub) => ub.finishDate)
    .map((ub) => new Date(ub.finishDate!).toISOString().split('T')[0])
    .sort()

  let longestStreak = 0
  let currentStreak = 0
  let prevDate: Date | null = null

  finishDates.forEach((dateStr) => {
    const currentDate = new Date(dateStr)
    if (prevDate) {
      const diffDays = Math.round(
        (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
      )
      if (diffDays <= 7) {
        // Consider within a week as part of streak
        currentStreak++
      } else {
        currentStreak = 1
      }
    } else {
      currentStreak = 1
    }
    longestStreak = Math.max(longestStreak, currentStreak)
    prevDate = currentDate
  })

  // Favorite quote (most recent)
  const allQuotes = finishedBooks.flatMap((ub) => ub.annotations)
  const favoriteQuote = allQuotes[0]?.content || null

  // Comparison to previous year
  const previousYearStart = new Date(year - 1, 0, 1)
  const previousYearEnd = new Date(year - 1, 11, 31, 23, 59, 59)
  const previousYearBooks = await db.userBook.findMany({
    where: {
      userId,
      status: 'READ',
      finishDate: {
        gte: previousYearStart,
        lte: previousYearEnd,
      },
    },
    include: { book: { select: { pageCount: true } } },
  })

  const comparisonToPreviousYear =
    previousYearBooks.length > 0
      ? {
          booksDiff: totalBooks - previousYearBooks.length,
          pagesDiff:
            totalPages -
            previousYearBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0),
        }
      : null

  return {
    year,
    totalBooks,
    totalPages,
    totalHours,
    totalSpent,
    averageRating,
    fastestBook,
    slowestBook,
    topAuthor,
    topPublisher,
    topCategory,
    longestStreak,
    mostProductiveMonth,
    favoriteQuote,
    booksPerMonth,
    comparisonToPreviousYear,
  }
}
