import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mockDb } from '../../mocks/db'
import {
  createFeedPost,
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  markNotificationsAsRead,
  getUnreadNotificationCount,
} from '@/lib/services/feed'

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createFeedPost', () => {
  it('cria post no feed', async () => {
    mockDb.feedPost.create.mockResolvedValueOnce({ id: 'post-1' })

    await createFeedPost('user-1', 'STARTED', 'ub-1')

    expect(mockDb.feedPost.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        type: 'STARTED',
        userBookId: 'ub-1',
        content: undefined,
      },
    })
  })

  it('cria post com conteúdo', async () => {
    mockDb.feedPost.create.mockResolvedValueOnce({ id: 'post-1' })

    await createFeedPost('user-1', 'QUOTE_SHARED', 'ub-1', 'Uma citação bonita')

    expect(mockDb.feedPost.create).toHaveBeenCalledWith({
      data: expect.objectContaining({ content: 'Uma citação bonita' }),
    })
  })
})

describe('likePost', () => {
  it('cria like e notificação quando é de outro usuário', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce({ userId: 'user-2' })

    await likePost('user-1', 'post-1')

    expect(mockDb.like.create).toHaveBeenCalledWith({
      data: { userId: 'user-1', feedPostId: 'post-1' },
    })
    expect(mockDb.notification.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-2',
        type: 'POST_LIKED',
        actorId: 'user-1',
        postId: 'post-1',
      },
    })
  })

  it('não cria notificação quando curte próprio post', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce({ userId: 'user-1' })

    await likePost('user-1', 'post-1')

    expect(mockDb.like.create).toHaveBeenCalled()
    expect(mockDb.notification.create).not.toHaveBeenCalled()
  })

  it('lança erro quando post não existe', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce(null)

    await expect(likePost('user-1', 'post-1')).rejects.toThrow('Post não encontrado')
  })
})

describe('unlikePost', () => {
  it('remove o like', async () => {
    await unlikePost('user-1', 'post-1')

    expect(mockDb.like.delete).toHaveBeenCalledWith({
      where: {
        feedPostId_userId: {
          feedPostId: 'post-1',
          userId: 'user-1',
        },
      },
    })
  })
})

describe('addComment', () => {
  it('cria comentário e notificação quando é de outro usuário', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce({ userId: 'user-2' })
    mockDb.comment.create.mockResolvedValueOnce({ id: 'comment-1', content: 'Ótimo!' })

    const result = await addComment('user-1', 'post-1', 'Ótimo!')

    expect(mockDb.comment.create).toHaveBeenCalled()
    expect(mockDb.notification.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-2',
        type: 'POST_COMMENTED',
        actorId: 'user-1',
      }),
    })
    expect(result.id).toBe('comment-1')
  })

  it('não cria notificação quando comenta no próprio post', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce({ userId: 'user-1' })
    mockDb.comment.create.mockResolvedValueOnce({ id: 'comment-1' })

    await addComment('user-1', 'post-1', 'Meu comentário')

    expect(mockDb.notification.create).not.toHaveBeenCalled()
  })

  it('lança erro quando post não existe', async () => {
    mockDb.feedPost.findUnique.mockResolvedValueOnce(null)

    await expect(addComment('user-1', 'post-1', 'oi')).rejects.toThrow('Post não encontrado')
  })
})

describe('deleteComment', () => {
  it('deleta comentário do próprio usuário', async () => {
    mockDb.comment.findUnique.mockResolvedValueOnce({ userId: 'user-1' })

    await deleteComment('user-1', 'comment-1')

    expect(mockDb.comment.delete).toHaveBeenCalledWith({
      where: { id: 'comment-1' },
    })
  })

  it('lança erro ao deletar comentário de outro usuário', async () => {
    mockDb.comment.findUnique.mockResolvedValueOnce({ userId: 'user-2' })

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(
      'Você não pode excluir este comentário'
    )
  })

  it('lança erro quando comentário não existe', async () => {
    mockDb.comment.findUnique.mockResolvedValueOnce(null)

    await expect(deleteComment('user-1', 'comment-1')).rejects.toThrow(
      'Comentário não encontrado'
    )
  })
})

describe('markNotificationsAsRead', () => {
  it('marca todas as notificações como lidas', async () => {
    await markNotificationsAsRead('user-1')

    expect(mockDb.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1' },
      data: { read: true },
    })
  })

  it('marca notificações específicas como lidas', async () => {
    await markNotificationsAsRead('user-1', ['n-1', 'n-2'])

    expect(mockDb.notification.updateMany).toHaveBeenCalledWith({
      where: { userId: 'user-1', id: { in: ['n-1', 'n-2'] } },
      data: { read: true },
    })
  })
})

describe('getUnreadNotificationCount', () => {
  it('retorna contagem de notificações não lidas', async () => {
    mockDb.notification.count.mockResolvedValueOnce(5)

    const result = await getUnreadNotificationCount('user-1')

    expect(result).toBe(5)
    expect(mockDb.notification.count).toHaveBeenCalledWith({
      where: { userId: 'user-1', read: false },
    })
  })
})
