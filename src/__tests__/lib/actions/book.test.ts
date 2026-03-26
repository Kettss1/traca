import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'

// Mock next/cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
}))

// Mock auth
const mockAuth = vi.fn()
vi.mock('@/lib/auth', () => ({
  auth: () => mockAuth(),
}))

// Mock color extraction
vi.mock('@/lib/api/colors', () => ({
  extractColorsFromImage: vi.fn().mockResolvedValue({ primary: '#000', secondary: '#fff' }),
}))

// Mock gamification
vi.mock('@/lib/services/gamification', () => ({
  awardPoints: vi.fn(),
  checkAchievements: vi.fn(),
}))

// Mock feed
vi.mock('@/lib/services/feed', () => ({
  createFeedPost: vi.fn(),
}))

import {
  addBookToShelf,
  updateUserBook,
  removeFromShelf,
  createAnnotation,
  deleteAnnotation,
  updateShelfOrder,
} from '@/lib/actions/book'

beforeEach(() => {
  vi.clearAllMocks()
  mockAuth.mockResolvedValue({ user: { id: 'user-1' } })
})

describe('addBookToShelf', () => {
  const validInput = {
    title: 'Dom Casmurro',
    authors: ['Machado de Assis'],
    status: 'WANT_TO_READ' as const,
    googleBooksId: 'google-123',
  }

  it('cria livro e userBook com sucesso', async () => {
    mockDb.book.findUnique.mockResolvedValueOnce(null) // Book doesn't exist
    mockDb.book.create.mockResolvedValueOnce({ id: 'book-1' })
    mockDb.userBook.findFirst.mockResolvedValueOnce(null) // Not in shelf
    mockDb.userBook.findFirst.mockResolvedValueOnce({ shelfPosition: 5 }) // Last position
    mockDb.userBook.create.mockResolvedValueOnce({ id: 'ub-1' })

    const result = await addBookToShelf(validInput)

    expect(result).toEqual({ success: true, data: { userBookId: 'ub-1' } })
    expect(mockDb.book.create).toHaveBeenCalled()
    expect(mockDb.userBook.create).toHaveBeenCalled()
  })

  it('reutiliza livro existente pelo googleBooksId', async () => {
    mockDb.book.findUnique.mockResolvedValueOnce({ id: 'existing-book' })
    mockDb.userBook.findFirst.mockResolvedValueOnce(null) // Not in shelf
    mockDb.userBook.findFirst.mockResolvedValueOnce(null) // No last position
    mockDb.userBook.create.mockResolvedValueOnce({ id: 'ub-1' })

    const result = await addBookToShelf(validInput)

    expect(result.success).toBe(true)
    expect(mockDb.book.create).not.toHaveBeenCalled()
  })

  it('retorna erro se livro já está na estante', async () => {
    mockDb.book.findUnique.mockResolvedValueOnce({ id: 'book-1' })
    mockDb.userBook.findFirst.mockResolvedValueOnce({ id: 'existing-ub' }) // Already in shelf

    const result = await addBookToShelf(validInput)

    expect(result).toEqual({
      success: false,
      error: 'Você já tem este livro na sua estante',
    })
  })

  it('retorna erro quando não autenticado', async () => {
    mockAuth.mockResolvedValueOnce(null)

    const result = await addBookToShelf(validInput)

    expect(result.success).toBe(false)
    expect(result).toHaveProperty('error')
  })

  it('retorna erro para input inválido', async () => {
    const result = await addBookToShelf({ title: '' } as any)

    expect(result.success).toBe(false)
  })
})

describe('updateUserBook', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

  it('atualiza livro com sucesso', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({
      id: validCuid,
      userId: 'user-1',
      status: 'READING',
      rating: null,
      bookId: 'book-1',
    })
    mockDb.userBook.update.mockResolvedValueOnce({})

    const result = await updateUserBook({ userBookId: validCuid, rating: 4 })

    expect(result).toEqual({ success: true, data: undefined })
  })

  it('auto-define startDate ao mudar para READING', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({
      id: validCuid,
      userId: 'user-1',
      status: 'WANT_TO_READ',
      rating: null,
      bookId: 'book-1',
    })
    mockDb.userBook.update.mockResolvedValueOnce({})

    await updateUserBook({ userBookId: validCuid, status: 'READING' })

    expect(mockDb.userBook.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ startDate: expect.any(Date) }),
      })
    )
  })

  it('auto-define finishDate ao mudar para READ', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({
      id: validCuid,
      userId: 'user-1',
      status: 'READING',
      rating: null,
      bookId: 'book-1',
    })
    mockDb.userBook.update.mockResolvedValueOnce({})

    await updateUserBook({ userBookId: validCuid, status: 'READ' })

    expect(mockDb.userBook.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ finishDate: expect.any(Date) }),
      })
    )
  })

  it('retorna erro quando livro não pertence ao usuário', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({
      id: validCuid,
      userId: 'other-user',
    })

    const result = await updateUserBook({ userBookId: validCuid, status: 'READ' })

    expect(result).toEqual({ success: false, error: 'Livro não encontrado' })
  })
})

describe('removeFromShelf', () => {
  it('remove livro com sucesso', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({ id: 'ub-1', userId: 'user-1' })
    mockDb.userBook.delete.mockResolvedValueOnce({})

    const result = await removeFromShelf('ub-1')

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockDb.userBook.delete).toHaveBeenCalledWith({ where: { id: 'ub-1' } })
  })

  it('retorna erro quando livro não pertence ao usuário', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({ id: 'ub-1', userId: 'other-user' })

    const result = await removeFromShelf('ub-1')

    expect(result).toEqual({ success: false, error: 'Livro não encontrado' })
  })
})

describe('createAnnotation', () => {
  const validCuid = 'clxxxxxxxxxxxxxxxxxxxxxxxxx'

  it('cria anotação com sucesso', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({ id: validCuid, userId: 'user-1', bookId: 'book-1' })
    mockDb.annotation.create.mockResolvedValueOnce({ id: 'ann-1' })

    const result = await createAnnotation({
      userBookId: validCuid,
      type: 'NOTE',
      content: 'Uma anotação',
    })

    expect(result).toEqual({ success: true, data: { annotationId: 'ann-1' } })
  })

  it('retorna erro quando userBook não pertence ao usuário', async () => {
    mockDb.userBook.findUnique.mockResolvedValueOnce({ id: validCuid, userId: 'other-user' })

    const result = await createAnnotation({
      userBookId: validCuid,
      type: 'NOTE',
      content: 'Teste',
    })

    expect(result).toEqual({ success: false, error: 'Livro não encontrado' })
  })
})

describe('deleteAnnotation', () => {
  it('faz soft delete da anotação', async () => {
    mockDb.annotation.findUnique.mockResolvedValueOnce({
      id: 'ann-1',
      userBook: { userId: 'user-1', bookId: 'book-1' },
    })
    mockDb.annotation.update.mockResolvedValueOnce({})

    const result = await deleteAnnotation('ann-1')

    expect(result).toEqual({ success: true, data: undefined })
    expect(mockDb.annotation.update).toHaveBeenCalledWith({
      where: { id: 'ann-1' },
      data: { deletedAt: expect.any(Date) },
    })
  })
})

describe('updateShelfOrder', () => {
  it('atualiza posições na estante', async () => {
    const orderData = [
      { userBookId: 'ub-1', position: 0 },
      { userBookId: 'ub-2', position: 1 },
    ]

    mockDb.userBook.findMany.mockResolvedValueOnce([{ id: 'ub-1' }, { id: 'ub-2' }])
    mockDb.$transaction.mockResolvedValueOnce(undefined)

    const result = await updateShelfOrder(orderData)

    expect(result).toEqual({ success: true, data: undefined })
  })

  it('retorna erro se nem todos os livros pertencem ao usuário', async () => {
    const orderData = [
      { userBookId: 'ub-1', position: 0 },
      { userBookId: 'ub-2', position: 1 },
    ]

    mockDb.userBook.findMany.mockResolvedValueOnce([{ id: 'ub-1' }]) // Only 1 found

    const result = await updateShelfOrder(orderData)

    expect(result).toEqual({ success: false, error: 'Alguns livros não foram encontrados' })
  })
})
