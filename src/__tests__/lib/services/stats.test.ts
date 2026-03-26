import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'
import {
  getUserReadingStats,
  getUserAuthorStats,
  getUserCategoryStats,
  getUserMonthlyStats,
  getUserReadingGoal,
} from '@/lib/services/stats'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeUserBook(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ub-1',
    userId: 'user-1',
    status: 'READ',
    rating: 4,
    currentPage: 300,
    acquisitionValue: 45.9,
    isReread: false,
    book: { pageCount: 300, authors: ['Author A'], publisher: 'Publisher A', categories: ['Fiction'] },
    _count: { rereads: 0 },
    startDate: new Date(2025, 0, 1),
    finishDate: new Date(2025, 0, 15),
    ...overrides,
  }
}

describe('getUserReadingStats', () => {
  it('calcula estatísticas corretamente com livros variados', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([
      makeUserBook({ status: 'READ', rating: 4, book: { pageCount: 300 }, _count: { rereads: 1 } }),
      makeUserBook({ id: 'ub-2', status: 'READ', rating: 5, book: { pageCount: 200 }, _count: { rereads: 0 } }),
      makeUserBook({ id: 'ub-3', status: 'READING', rating: null, book: { pageCount: 400 }, _count: { rereads: 0 } }),
      makeUserBook({ id: 'ub-4', status: 'WANT_TO_READ', rating: null, book: { pageCount: 150 }, _count: { rereads: 0 } }),
      makeUserBook({ id: 'ub-5', status: 'ABANDONED', rating: 2, book: { pageCount: 100 }, _count: { rereads: 0 } }),
    ])

    const stats = await getUserReadingStats('user-1')

    expect(stats.totalBooks).toBe(5)
    expect(stats.booksRead).toBe(2)
    expect(stats.booksReading).toBe(1)
    expect(stats.booksWantToRead).toBe(1)
    expect(stats.booksAbandoned).toBe(1)
    expect(stats.totalPages).toBe(1150) // 300+200+400+150+100
    expect(stats.pagesRead).toBe(500) // 300+200 (only READ)
    expect(stats.ratedBooks).toBe(3) // 3 have non-null ratings
    expect(stats.averageRating).toBeCloseTo(3.67, 1) // (4+5+2)/3
    expect(stats.totalRereads).toBe(1)
  })

  it('retorna zeros para usuário sem livros', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([])

    const stats = await getUserReadingStats('user-1')

    expect(stats.totalBooks).toBe(0)
    expect(stats.booksRead).toBe(0)
    expect(stats.averageRating).toBe(0)
    expect(stats.estimatedHours).toBe(0)
  })

  it('calcula horas estimadas de leitura', async () => {
    // 1000 pages * 250 words/page / 200 words/min = 1250 min = ~21 hours
    mockDb.userBook.findMany.mockResolvedValueOnce([
      makeUserBook({ status: 'READ', book: { pageCount: 1000 }, _count: { rereads: 0 } }),
    ])

    const stats = await getUserReadingStats('user-1')

    expect(stats.estimatedHours).toBe(21)
  })
})

describe('getUserAuthorStats', () => {
  it('conta e ordena autores corretamente', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([
      makeUserBook({ book: { authors: ['Machado de Assis'] } }),
      makeUserBook({ id: 'ub-2', book: { authors: ['Machado de Assis'] } }),
      makeUserBook({ id: 'ub-3', book: { authors: ['Clarice Lispector'] } }),
      makeUserBook({ id: 'ub-4', book: { authors: ['Machado de Assis', 'Outro'] } }),
    ])

    const result = await getUserAuthorStats('user-1')

    expect(result[0]).toEqual({ name: 'Machado de Assis', count: 3 })
    expect(result[1]).toEqual({ name: 'Clarice Lispector', count: 1 })
  })

  it('retorna array vazio para usuário sem livros', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([])

    const result = await getUserAuthorStats('user-1')

    expect(result).toEqual([])
  })
})

describe('getUserCategoryStats', () => {
  it('conta e ordena categorias', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([
      makeUserBook({ book: { categories: ['Fiction', 'Romance'] } }),
      makeUserBook({ id: 'ub-2', book: { categories: ['Fiction'] } }),
    ])

    const result = await getUserCategoryStats('user-1')

    expect(result[0]).toEqual({ name: 'Fiction', count: 2 })
    expect(result[1]).toEqual({ name: 'Romance', count: 1 })
  })
})

describe('getUserMonthlyStats', () => {
  it('agrupa livros por mês corretamente', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([
      makeUserBook({
        finishDate: new Date(2025, 0, 15), // Janeiro
        book: { pageCount: 200 },
        acquisitionValue: 30,
      }),
      makeUserBook({
        id: 'ub-2',
        finishDate: new Date(2025, 0, 20), // Janeiro
        book: { pageCount: 300 },
        acquisitionValue: 40,
      }),
      makeUserBook({
        id: 'ub-3',
        finishDate: new Date(2025, 5, 10), // Junho
        book: { pageCount: 150 },
        acquisitionValue: 25,
      }),
    ])

    const result = await getUserMonthlyStats('user-1', 2025)

    expect(result).toHaveLength(12)
    expect(result[0]).toEqual({ month: 'Jan', booksFinished: 2, pagesRead: 500, spent: 70 })
    expect(result[5]).toEqual({ month: 'Jun', booksFinished: 1, pagesRead: 150, spent: 25 })
    expect(result[11]).toEqual({ month: 'Dez', booksFinished: 0, pagesRead: 0, spent: 0 })
  })
})

describe('getUserReadingGoal', () => {
  it('retorna progresso da meta', async () => {
    mockDb.readingGoal.findUnique.mockResolvedValueOnce({
      year: 2025,
      targetBooks: 24,
    })
    mockDb.userBook.count.mockResolvedValueOnce(12)

    const result = await getUserReadingGoal('user-1', 2025)

    expect(result).toEqual({
      year: 2025,
      target: 24,
      current: 12,
      percentage: 50,
    })
  })

  it('retorna null quando não há meta', async () => {
    mockDb.readingGoal.findUnique.mockResolvedValueOnce(null)

    const result = await getUserReadingGoal('user-1', 2025)

    expect(result).toBeNull()
  })

  it('limita porcentagem em 100%', async () => {
    mockDb.readingGoal.findUnique.mockResolvedValueOnce({
      year: 2025,
      targetBooks: 10,
    })
    mockDb.userBook.count.mockResolvedValueOnce(15)

    const result = await getUserReadingGoal('user-1', 2025)

    expect(result!.percentage).toBe(100)
  })
})
