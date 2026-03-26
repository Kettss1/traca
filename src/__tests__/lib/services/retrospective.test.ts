import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'
import { getRetrospectiveData } from '@/lib/services/retrospective'

beforeEach(() => {
  vi.clearAllMocks()
})

function makeFinishedBook(overrides: Record<string, unknown> = {}) {
  return {
    id: 'ub-1',
    status: 'READ',
    rating: 4,
    acquisitionValue: 40,
    startDate: new Date(2025, 0, 1),
    finishDate: new Date(2025, 0, 15),
    book: {
      title: 'Livro Teste',
      authors: ['Autor A'],
      publisher: 'Editora X',
      pageCount: 300,
      categories: ['Fiction'],
    },
    annotations: [],
    ...overrides,
  }
}

describe('getRetrospectiveData', () => {
  it('retorna null quando não há livros finalizados no ano', async () => {
    mockDb.userBook.findMany.mockResolvedValueOnce([])

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result).toBeNull()
  })

  it('calcula dados básicos corretamente', async () => {
    mockDb.userBook.findMany
      .mockResolvedValueOnce([
        makeFinishedBook({
          rating: 4,
          acquisitionValue: 40,
          book: { title: 'Livro 1', authors: ['Autor A'], publisher: 'Editora X', pageCount: 300, categories: ['Fiction'] },
          finishDate: new Date(2025, 0, 15),
        }),
        makeFinishedBook({
          id: 'ub-2',
          rating: 5,
          acquisitionValue: 60,
          book: { title: 'Livro 2', authors: ['Autor A'], publisher: 'Editora Y', pageCount: 200, categories: ['Romance'] },
          finishDate: new Date(2025, 5, 10),
        }),
      ])
      // Previous year query
      .mockResolvedValueOnce([])

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result).not.toBeNull()
    expect(result!.year).toBe(2025)
    expect(result!.totalBooks).toBe(2)
    expect(result!.totalPages).toBe(500)
    expect(result!.totalSpent).toBe(100)
    expect(result!.averageRating).toBe(4.5)
    expect(result!.topAuthor).toEqual({ name: 'Autor A', count: 2 })
  })

  it('identifica livro mais rápido e mais lento', async () => {
    mockDb.userBook.findMany
      .mockResolvedValueOnce([
        makeFinishedBook({
          startDate: new Date(2025, 0, 1),
          finishDate: new Date(2025, 0, 3), // 2 dias
          book: { title: 'Rápido', authors: ['A'], publisher: 'P', pageCount: 100, categories: [] },
        }),
        makeFinishedBook({
          id: 'ub-2',
          startDate: new Date(2025, 0, 1),
          finishDate: new Date(2025, 1, 1), // 31 dias
          book: { title: 'Lento', authors: ['B'], publisher: 'P', pageCount: 500, categories: [] },
        }),
      ])
      .mockResolvedValueOnce([])

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result!.fastestBook!.title).toBe('Rápido')
    expect(result!.fastestBook!.days).toBe(2)
    expect(result!.slowestBook!.title).toBe('Lento')
    expect(result!.slowestBook!.days).toBe(31)
  })

  it('calcula books per month', async () => {
    mockDb.userBook.findMany
      .mockResolvedValueOnce([
        makeFinishedBook({ finishDate: new Date(2025, 0, 10), book: { title: 'A', authors: [], publisher: null, pageCount: 100, categories: [] } }),
        makeFinishedBook({ id: 'ub-2', finishDate: new Date(2025, 0, 20), book: { title: 'B', authors: [], publisher: null, pageCount: 100, categories: [] } }),
        makeFinishedBook({ id: 'ub-3', finishDate: new Date(2025, 6, 5), book: { title: 'C', authors: [], publisher: null, pageCount: 100, categories: [] } }),
      ])
      .mockResolvedValueOnce([])

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result!.booksPerMonth[0]).toBe(2) // Jan
    expect(result!.booksPerMonth[6]).toBe(1) // Jul
    expect(result!.booksPerMonth[11]).toBe(0) // Dez
    expect(result!.mostProductiveMonth).toEqual({ month: 'Jan', count: 2 })
  })

  it('calcula comparação com ano anterior', async () => {
    mockDb.userBook.findMany
      .mockResolvedValueOnce([
        makeFinishedBook({ book: { title: 'A', authors: [], publisher: null, pageCount: 300, categories: [] } }),
      ])
      // Previous year: 2 books, 500 pages
      .mockResolvedValueOnce([
        { book: { pageCount: 250 } },
        { book: { pageCount: 250 } },
      ])

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result!.comparisonToPreviousYear).toEqual({
      booksDiff: -1, // 1 - 2
      pagesDiff: -200, // 300 - 500
    })
  })

  it('retorna null para comparação quando não há dados do ano anterior', async () => {
    mockDb.userBook.findMany
      .mockResolvedValueOnce([makeFinishedBook()])
      .mockResolvedValueOnce([]) // No previous year data

    const result = await getRetrospectiveData('user-1', 2025)

    expect(result!.comparisonToPreviousYear).toBeNull()
  })
})
