import { db } from '@/lib/db'

export interface ReadingStats {
  totalBooks: number
  booksRead: number
  booksReading: number
  booksWantToRead: number
  booksAbandoned: number
  totalPages: number
  pagesRead: number
  estimatedHours: number
  totalSpent: number
  averageRating: number
  ratedBooks: number
  totalRereads: number
}

export interface AuthorStats {
  name: string
  count: number
}

export interface PublisherStats {
  name: string
  count: number
}

export interface CategoryStats {
  name: string
  count: number
}

export interface MonthlyStats {
  month: string
  booksFinished: number
  pagesRead: number
  spent: number
}

export interface ReadingGoalProgress {
  year: number
  target: number
  current: number
  percentage: number
}

export async function getUserReadingStats(userId: string): Promise<ReadingStats> {
  const userBooks = await db.userBook.findMany({
    where: { userId, isReread: false },
    include: {
      book: { select: { pageCount: true } },
      _count: { select: { rereads: true } },
    },
  })

  const totalBooks = userBooks.length
  const booksRead = userBooks.filter((ub) => ub.status === 'READ').length
  const booksReading = userBooks.filter((ub) => ub.status === 'READING').length
  const booksWantToRead = userBooks.filter((ub) => ub.status === 'WANT_TO_READ').length
  const booksAbandoned = userBooks.filter((ub) => ub.status === 'ABANDONED').length

  const totalPages = userBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0)
  const pagesRead = userBooks
    .filter((ub) => ub.status === 'READ')
    .reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0)

  // Estimate ~250 words per page, ~200 words per minute average reading speed
  const estimatedMinutes = (pagesRead * 250) / 200
  const estimatedHours = Math.round(estimatedMinutes / 60)

  const totalSpent = userBooks.reduce((sum, ub) => sum + (ub.acquisitionValue || 0), 0)

  const ratedBooks = userBooks.filter((ub) => ub.rating !== null)
  const averageRating =
    ratedBooks.length > 0
      ? ratedBooks.reduce((sum, ub) => sum + (ub.rating || 0), 0) / ratedBooks.length
      : 0

  const totalRereads = userBooks.reduce((sum, ub) => sum + (ub._count.rereads || 0), 0)

  return {
    totalBooks,
    booksRead,
    booksReading,
    booksWantToRead,
    booksAbandoned,
    totalPages,
    pagesRead,
    estimatedHours,
    totalSpent,
    averageRating,
    ratedBooks: ratedBooks.length,
    totalRereads,
  }
}

export async function getUserAuthorStats(userId: string, limit = 10): Promise<AuthorStats[]> {
  const userBooks = await db.userBook.findMany({
    where: { userId, isReread: false },
    include: { book: { select: { authors: true } } },
  })

  const authorCounts: Record<string, number> = {}
  userBooks.forEach((ub) => {
    ub.book.authors.forEach((author) => {
      authorCounts[author] = (authorCounts[author] || 0) + 1
    })
  })

  return Object.entries(authorCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getUserPublisherStats(userId: string, limit = 10): Promise<PublisherStats[]> {
  const userBooks = await db.userBook.findMany({
    where: { userId, isReread: false },
    include: { book: { select: { publisher: true } } },
  })

  const publisherCounts: Record<string, number> = {}
  userBooks.forEach((ub) => {
    if (ub.book.publisher) {
      publisherCounts[ub.book.publisher] = (publisherCounts[ub.book.publisher] || 0) + 1
    }
  })

  return Object.entries(publisherCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getUserCategoryStats(userId: string, limit = 10): Promise<CategoryStats[]> {
  const userBooks = await db.userBook.findMany({
    where: { userId, isReread: false },
    include: { book: { select: { categories: true } } },
  })

  const categoryCounts: Record<string, number> = {}
  userBooks.forEach((ub) => {
    ub.book.categories.forEach((category) => {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1
    })
  })

  return Object.entries(categoryCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}

export async function getUserMonthlyStats(userId: string, year: number): Promise<MonthlyStats[]> {
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const userBooks = await db.userBook.findMany({
    where: {
      userId,
      finishDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    include: { book: { select: { pageCount: true } } },
  })

  const months = [
    'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun',
    'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez',
  ]

  return months.map((month, index) => {
    const monthBooks = userBooks.filter((ub) => {
      const finishDate = ub.finishDate ? new Date(ub.finishDate) : null
      return finishDate && finishDate.getMonth() === index
    })

    return {
      month,
      booksFinished: monthBooks.length,
      pagesRead: monthBooks.reduce((sum, ub) => sum + (ub.book.pageCount || 0), 0),
      spent: monthBooks.reduce((sum, ub) => sum + (ub.acquisitionValue || 0), 0),
    }
  })
}

export async function getUserReadingGoal(userId: string, year: number): Promise<ReadingGoalProgress | null> {
  const goal = await db.readingGoal.findUnique({
    where: { userId_year: { userId, year } },
  })

  if (!goal) return null

  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const booksRead = await db.userBook.count({
    where: {
      userId,
      status: 'READ',
      finishDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
  })

  return {
    year: goal.year,
    target: goal.targetBooks,
    current: booksRead,
    percentage: Math.min(100, Math.round((booksRead / goal.targetBooks) * 100)),
  }
}

export async function getReadingCalendarData(userId: string, year: number) {
  // Get all books finished in the year with their finish dates
  const startOfYear = new Date(year, 0, 1)
  const endOfYear = new Date(year, 11, 31, 23, 59, 59)

  const finishedBooks = await db.userBook.findMany({
    where: {
      userId,
      status: 'READ',
      finishDate: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: { finishDate: true },
  })

  // Also get reading logs for pages read per day
  const readingLogs = await db.readingLog.findMany({
    where: {
      userBook: { userId },
      date: {
        gte: startOfYear,
        lte: endOfYear,
      },
    },
    select: { date: true, pagesRead: true },
  })

  // Create a map of date -> activity count
  const activityMap: Record<string, number> = {}

  finishedBooks.forEach((book) => {
    if (book.finishDate) {
      const dateKey = book.finishDate.toISOString().split('T')[0]
      activityMap[dateKey] = (activityMap[dateKey] || 0) + 10 // Weight finishing a book
    }
  })

  readingLogs.forEach((log) => {
    const dateKey = log.date.toISOString().split('T')[0]
    activityMap[dateKey] = (activityMap[dateKey] || 0) + Math.min(log.pagesRead / 10, 5) // Weight pages read
  })

  return activityMap
}
