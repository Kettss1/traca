'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import {
  followUser,
  unfollowUser,
  isFollowing as checkIsFollowing,
  searchUsers,
} from '@/lib/services/social'
import {
  likePost,
  unlikePost,
  addComment,
  deleteComment,
  markNotificationsAsRead,
  createFeedPost,
  getPostComments,
} from '@/lib/services/feed'
import { awardPoints, checkAchievements } from '@/lib/services/gamification'
import type { FeedPostType } from '@/generated/prisma'

export async function toggleFollow(userId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  if (session.user.id === userId) {
    return { success: false, error: 'Você não pode seguir a si mesmo' }
  }

  try {
    const following = await checkIsFollowing(session.user.id, userId)

    if (following) {
      await unfollowUser(session.user.id, userId)
    } else {
      await followUser(session.user.id, userId)
      // Check achievements for the user who gained a follower
      await checkAchievements(userId)
    }

    revalidatePath('/feed')
    revalidatePath('/profile/[username]', 'page')

    return { success: true, isFollowing: !following }
  } catch (error) {
    console.error('Error toggling follow:', error)
    return { success: false, error: 'Erro ao processar solicitação' }
  }
}

export async function toggleLike(postId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    // Check if already liked
    const { db } = await import('@/lib/db')
    const existingLike = await db.like.findUnique({
      where: {
        feedPostId_userId: {
          feedPostId: postId,
          userId: session.user.id,
        },
      },
    })

    if (existingLike) {
      await unlikePost(session.user.id, postId)
    } else {
      await likePost(session.user.id, postId)
    }

    revalidatePath('/feed')

    return { success: true, isLiked: !existingLike }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, error: 'Erro ao processar solicitação' }
  }
}

export async function submitComment(postId: string, content: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  const trimmed = content.trim()
  if (!trimmed || trimmed.length > 2000) {
    return { success: false, error: 'Comentário deve ter entre 1 e 2000 caracteres' }
  }

  try {
    const comment = await addComment(session.user.id, postId, trimmed)
    revalidatePath('/feed')

    return { success: true, comment }
  } catch (error) {
    console.error('Error adding comment:', error)
    return { success: false, error: 'Erro ao adicionar comentário' }
  }
}

export async function removeComment(commentId: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await deleteComment(session.user.id, commentId)
    revalidatePath('/feed')

    return { success: true }
  } catch (error) {
    console.error('Error deleting comment:', error)
    return { success: false, error: 'Erro ao excluir comentário' }
  }
}

export async function markNotificationsRead(notificationIds?: string[]) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  try {
    await markNotificationsAsRead(session.user.id, notificationIds)
    return { success: true }
  } catch (error) {
    console.error('Error marking notifications as read:', error)
    return { success: false, error: 'Erro ao marcar notificações como lidas' }
  }
}

export async function shareQuote(userBookId: string, quote: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  if (!quote.trim() || quote.trim().length > 2000) {
    return { success: false, error: 'Citação deve ter entre 1 e 2000 caracteres' }
  }

  try {
    // Verify ownership of the userBook
    const { db } = await import('@/lib/db')
    const userBook = await db.userBook.findUnique({
      where: { id: userBookId },
      select: { userId: true },
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }

    await createFeedPost(session.user.id, 'QUOTE_SHARED' as FeedPostType, userBookId, quote.trim())

    // Award points for sharing quote
    await awardPoints(session.user.id, 'QUOTE_SHARED', {
      description: 'Compartilhou uma citação',
      referenceId: userBookId,
    })

    revalidatePath('/feed')

    return { success: true }
  } catch (error) {
    console.error('Error sharing quote:', error)
    return { success: false, error: 'Erro ao compartilhar citação' }
  }
}

export async function createPost(type: FeedPostType, userBookId?: string, content?: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return { success: false, error: 'Não autorizado' }
  }

  if (content && content.length > 5000) {
    return { success: false, error: 'Conteúdo muito longo' }
  }

  // Verify ownership of the userBook if provided
  if (userBookId) {
    const { db } = await import('@/lib/db')
    const userBook = await db.userBook.findUnique({
      where: { id: userBookId },
      select: { userId: true },
    })

    if (!userBook || userBook.userId !== session.user.id) {
      return { success: false, error: 'Livro não encontrado' }
    }
  }

  try {
    await createFeedPost(session.user.id, type, userBookId, content)
    revalidatePath('/feed')

    return { success: true }
  } catch (error) {
    console.error('Error creating post:', error)
    return { success: false, error: 'Erro ao criar post' }
  }
}

export async function getPostCommentsAction(postId: string) {
  try {
    return await getPostComments(postId)
  } catch (error) {
    console.error('Error loading comments:', error)
    return []
  }
}

export async function searchUsersAction(query: string) {
  const session = await auth()

  if (!session?.user?.id) {
    return []
  }

  try {
    return await searchUsers(query, session.user.id)
  } catch (error) {
    console.error('Error searching users:', error)
    return []
  }
}
