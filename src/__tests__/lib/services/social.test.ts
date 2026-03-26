import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'
import {
  getUserProfile,
  followUser,
  unfollowUser,
  isFollowing,
  searchUsers,
} from '@/lib/services/social'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('getUserProfile', () => {
  it('retorna perfil do usuário com contagens', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      username: 'ket',
      name: 'Ket',
      avatarUrl: null,
      bio: 'Leitora ávida',
      _count: { followers: 10, following: 5, userBooks: 42 },
    })

    const result = await getUserProfile('ket')

    expect(result).toEqual({
      id: 'user-1',
      username: 'ket',
      name: 'Ket',
      avatarUrl: null,
      bio: 'Leitora ávida',
      followersCount: 10,
      followingCount: 5,
      booksRead: 42,
      isFollowing: false,
    })
  })

  it('retorna null quando usuário não existe', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce(null)

    const result = await getUserProfile('nonexistent')

    expect(result).toBeNull()
  })

  it('verifica se currentUser segue o perfil', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({
      id: 'user-2',
      username: 'reader',
      name: 'Reader',
      avatarUrl: null,
      bio: null,
      _count: { followers: 1, following: 0, userBooks: 0 },
    })
    mockDb.follow.findUnique.mockResolvedValueOnce({ followerId: 'user-1', followingId: 'user-2' })

    const result = await getUserProfile('reader', 'user-1')

    expect(result!.isFollowing).toBe(true)
  })

  it('não verifica follow quando é o próprio perfil', async () => {
    mockDb.user.findUnique.mockResolvedValueOnce({
      id: 'user-1',
      username: 'ket',
      name: 'Ket',
      avatarUrl: null,
      bio: null,
      _count: { followers: 0, following: 0, userBooks: 0 },
    })

    const result = await getUserProfile('ket', 'user-1')

    expect(result!.isFollowing).toBe(false)
    expect(mockDb.follow.findUnique).not.toHaveBeenCalled()
  })
})

describe('followUser', () => {
  it('cria follow e notificação', async () => {
    await followUser('user-1', 'user-2')

    expect(mockDb.follow.create).toHaveBeenCalledWith({
      data: { followerId: 'user-1', followingId: 'user-2' },
    })
    expect(mockDb.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-2',
        type: 'NEW_FOLLOWER',
        actorId: 'user-1',
      },
    })
  })

  it('lança erro ao seguir a si mesmo', async () => {
    await expect(followUser('user-1', 'user-1')).rejects.toThrow(
      'Você não pode seguir a si mesmo'
    )
  })
})

describe('unfollowUser', () => {
  it('remove o follow', async () => {
    await unfollowUser('user-1', 'user-2')

    expect(mockDb.follow.delete).toHaveBeenCalledWith({
      where: {
        followerId_followingId: {
          followerId: 'user-1',
          followingId: 'user-2',
        },
      },
    })
  })
})

describe('isFollowing', () => {
  it('retorna true quando segue', async () => {
    mockDb.follow.findUnique.mockResolvedValueOnce({ followerId: 'user-1', followingId: 'user-2' })

    const result = await isFollowing('user-1', 'user-2')

    expect(result).toBe(true)
  })

  it('retorna false quando não segue', async () => {
    mockDb.follow.findUnique.mockResolvedValueOnce(null)

    const result = await isFollowing('user-1', 'user-2')

    expect(result).toBe(false)
  })
})

describe('searchUsers', () => {
  it('busca usuários e indica quem é seguido', async () => {
    mockDb.user.findMany.mockResolvedValueOnce([
      { id: 'u1', username: 'reader1', name: 'Reader', avatarUrl: null, bio: null, _count: { userBooks: 5 } },
      { id: 'u2', username: 'reader2', name: 'Reader 2', avatarUrl: null, bio: null, _count: { userBooks: 10 } },
    ])
    mockDb.follow.findMany.mockResolvedValueOnce([
      { followerId: 'me', followingId: 'u1' },
    ])

    const result = await searchUsers('reader', 'me')

    expect(result).toHaveLength(2)
    expect(result[0].isFollowing).toBe(true)
    expect(result[0].booksRead).toBe(5)
    expect(result[1].isFollowing).toBe(false)
  })

  it('retorna lista sem follow info quando não há currentUser', async () => {
    mockDb.user.findMany.mockResolvedValueOnce([
      { id: 'u1', username: 'reader1', name: 'Reader', avatarUrl: null, bio: null, _count: { userBooks: 5 } },
    ])

    const result = await searchUsers('reader')

    expect(result[0].isFollowing).toBe(false)
    expect(mockDb.follow.findMany).not.toHaveBeenCalled()
  })
})
