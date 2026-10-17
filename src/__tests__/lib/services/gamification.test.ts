import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'
import {
  awardPoints,
  awardCoins,
  spendCoins,
  getUserAchievements,
  getLeaderboard,
  getUserPointsHistory,
  requirementProgress,
} from '@/lib/services/gamification'

beforeEach(() => {
  vi.clearAllMocks()

  // Default mocks for checkAchievements' internal getUserStats calls
  mockDb.userBook.count.mockResolvedValue(0)
  mockDb.userBook.aggregate.mockResolvedValue({ _sum: { currentPage: 0 } })
  mockDb.follow.count.mockResolvedValue(0)
  mockDb.annotation.count.mockResolvedValue(0)
  mockDb.feedPost.count.mockResolvedValue(0)
  mockDb.user.findUnique.mockResolvedValue({ points: 0, createdAt: new Date() })
  mockDb.userBook.findMany.mockResolvedValue([])
  mockDb.achievement.findMany.mockResolvedValue([])
})

describe('awardPoints', () => {
  it('incrementa pontos do usuário e cria log', async () => {
    mockDb.$transaction.mockResolvedValueOnce(undefined)

    await awardPoints('user-1', 'BOOK_ADDED')

    expect(mockDb.$transaction).toHaveBeenCalledWith([
      expect.anything(), // user.update
      expect.anything(), // pointsLog.create
    ])
  })

  it('não faz nada para ações com 0 pontos', async () => {
    await awardPoints('user-1', 'ACHIEVEMENT_EARNED')

    expect(mockDb.$transaction).not.toHaveBeenCalled()
  })

  it('usa pontos customizados quando fornecidos', async () => {
    mockDb.$transaction.mockResolvedValueOnce(undefined)

    await awardPoints('user-1', 'BOOK_ADDED', { customPoints: 100 })

    expect(mockDb.$transaction).toHaveBeenCalled()
  })
})

describe('awardCoins', () => {
  it('incrementa moedas do usuário', async () => {
    await awardCoins('user-1', 50)

    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { coins: { increment: 50 } },
    })
  })

  it('não faz nada para valor zero ou negativo', async () => {
    await awardCoins('user-1', 0)
    await awardCoins('user-1', -5)

    expect(mockDb.user.update).not.toHaveBeenCalled()
  })
})

describe('spendCoins', () => {
  it('retorna true e decrementa quando usuário tem moedas suficientes', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ coins: 100 })

    const result = await spendCoins('user-1', 50)

    expect(result).toBe(true)
    expect(mockDb.user.update).toHaveBeenCalledWith({
      where: { id: 'user-1' },
      data: { coins: { decrement: 50 } },
    })
  })

  it('retorna false quando usuário não tem moedas suficientes', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({ coins: 10 })

    const result = await spendCoins('user-1', 50)

    expect(result).toBe(false)
    expect(mockDb.user.update).not.toHaveBeenCalled()
  })

  it('retorna false quando usuário não existe', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null)

    const result = await spendCoins('user-1', 50)

    expect(result).toBe(false)
  })
})

describe('getUserAchievements', () => {
  it('retorna conquistas com progresso do usuário', async () => {
    const achievements = [
      { id: 'ach-1', name: 'Primeiro Livro', isSecret: false },
      { id: 'ach-2', name: 'Leitor Ávido', isSecret: false },
    ]
    const userAchievements = [
      { achievementId: 'ach-1', progress: 100, earnedAt: new Date(), achievement: achievements[0] },
    ]

    mockDb.userAchievement.findMany.mockResolvedValueOnce(userAchievements)
    mockDb.achievement.findMany.mockResolvedValueOnce(achievements)

    const result = await getUserAchievements('user-1')

    expect(result).toHaveLength(2)
    expect(result[0].isEarned).toBe(true)
    expect(result[0].progress).toBe(100)
    expect(result[1].isEarned).toBe(false)
    expect(result[1].progress).toBe(0)
  })
})

describe('getLeaderboard', () => {
  it('retorna leaderboard de pontos', async () => {
    const users = [
      { id: '1', username: 'reader1', name: 'Reader 1', avatarUrl: null, points: 500 },
      { id: '2', username: 'reader2', name: 'Reader 2', avatarUrl: null, points: 300 },
    ]
    mockDb.user.findMany.mockResolvedValueOnce(users)

    const result = await getLeaderboard('points')

    expect(result).toEqual(users)
    expect(mockDb.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        orderBy: { points: 'desc' },
        take: 10,
      })
    )
  })

  it('retorna leaderboard de livros lidos', async () => {
    const users = [
      {
        id: '1', username: 'reader1', name: 'Reader 1', avatarUrl: null,
        _count: { userBooks: 15 },
      },
    ]
    mockDb.user.findMany.mockResolvedValueOnce(users)

    const result = await getLeaderboard('books')

    expect(result[0].booksRead).toBe(15)
  })

  it('retorna leaderboard de páginas lidas', async () => {
    mockDb.userBook.groupBy.mockResolvedValueOnce([
      { userId: 'u1', _sum: { currentPage: 5000 } },
    ])
    mockDb.user.findMany.mockResolvedValueOnce([
      { id: 'u1', username: 'reader1', name: 'Reader 1', avatarUrl: null },
    ])

    const result = await getLeaderboard('pages')

    expect(result[0].pagesRead).toBe(5000)
  })
})

describe('getUserPointsHistory', () => {
  it('retorna histórico de pontos do usuário', async () => {
    const logs = [
      { id: '1', action: 'BOOK_ADDED', points: 10, createdAt: new Date() },
    ]
    mockDb.pointsLog.findMany.mockResolvedValueOnce(logs)

    const result = await getUserPointsHistory('user-1')

    expect(result).toEqual(logs)
    expect(mockDb.pointsLog.findMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      orderBy: { createdAt: 'desc' },
      take: 20,
    })
  })
})

describe('requirementProgress', () => {
  const stats = {
    booksCount: 18, booksReadCount: 11, pagesRead: 3208, followersCount: 2, followingCount: 2,
    annotationsCount: 0, quotesSharedCount: 0, points: 840, streak: 1, accountAgeDays: 9,
  }

  it('calcula atual e alvo para requisito único', () => {
    expect(requirementProgress({ booksRead: 100 }, stats)).toEqual({ current: 11, target: 100 })
  })

  it('limita o atual ao alvo', () => {
    expect(requirementProgress({ pagesRead: 1000 }, stats)).toEqual({ current: 1000, target: 1000 })
  })

  it('ignora requisitos compostos, vazios ou desconhecidos', () => {
    expect(requirementProgress({}, stats)).toBeNull()
    expect(requirementProgress({ booksRead: 1, points: 10 }, stats)).toBeNull()
    expect(requirementProgress({ algoNovo: 3 }, stats)).toBeNull()
    expect(requirementProgress(null, stats)).toBeNull()
  })
})
