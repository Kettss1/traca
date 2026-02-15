import { db } from '@/lib/db'
import type { FeedPostType } from '@/generated/prisma'

export interface FeedPostData {
  id: string
  type: FeedPostType
  content: string | null
  createdAt: Date
  user: {
    id: string
    username: string | null
    name: string | null
    avatarUrl: string | null
  }
  book: {
    id: string
    title: string
    authors: string[]
    coverUrl: string | null
  } | null
  rating: number | null
  likesCount: number
  commentsCount: number
  isLiked: boolean
}

export async function createFeedPost(
  userId: string,
  type: FeedPostType,
  userBookId?: string,
  content?: string
) {
  return db.feedPost.create({
    data: {
      userId,
      type,
      userBookId,
      content,
    },
  })
}

export async function getFeedPosts(
  userId: string,
  options: {
    feedType: 'home' | 'user' | 'global'
    targetUserId?: string
    cursor?: string
    limit?: number
  }
): Promise<{ posts: FeedPostData[]; nextCursor: string | null }> {
  const { feedType, targetUserId, cursor, limit = 20 } = options

  // Build where clause based on feed type
  let whereClause: Record<string, unknown> = {}

  if (feedType === 'home') {
    // Get posts from users the current user follows + own posts
    const following = await db.follow.findMany({
      where: { followerId: userId },
      select: { followingId: true },
    })
    const followingIds = following.map((f) => f.followingId)
    whereClause = {
      userId: { in: [...followingIds, userId] },
    }
  } else if (feedType === 'user' && targetUserId) {
    whereClause = { userId: targetUserId }
  }
  // Global feed has no where clause - shows all posts

  const posts = await db.feedPost.findMany({
    where: {
      ...whereClause,
      ...(cursor ? { createdAt: { lt: new Date(cursor) } } : {}),
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      userBook: {
        include: {
          book: {
            select: {
              id: true,
              title: true,
              authors: true,
              coverUrl: true,
            },
          },
        },
      },
      _count: {
        select: {
          likes: true,
          comments: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit + 1, // Get one extra to check if there are more
  })

  // Check if current user liked each post
  const postIds = posts.map((p) => p.id)
  const userLikes = await db.like.findMany({
    where: {
      userId,
      feedPostId: { in: postIds },
    },
  })
  const likedSet = new Set(userLikes.map((l) => l.feedPostId))

  const hasMore = posts.length > limit
  const postsToReturn = hasMore ? posts.slice(0, limit) : posts

  return {
    posts: postsToReturn.map((post) => ({
      id: post.id,
      type: post.type,
      content: post.content,
      createdAt: post.createdAt,
      user: post.user,
      book: post.userBook?.book || null,
      rating: post.userBook?.rating || null,
      likesCount: post._count.likes,
      commentsCount: post._count.comments,
      isLiked: likedSet.has(post.id),
    })),
    nextCursor: hasMore ? postsToReturn[postsToReturn.length - 1].createdAt.toISOString() : null,
  }
}

export async function likePost(userId: string, postId: string) {
  const post = await db.feedPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  if (!post) throw new Error('Post não encontrado')

  await db.like.create({
    data: {
      userId,
      feedPostId: postId,
    },
  })

  // Create notification if liking someone else's post
  if (post.userId !== userId) {
    await db.notification.create({
      data: {
        userId: post.userId,
        type: 'POST_LIKED',
        actorId: userId,
        postId,
      },
    })
  }
}

export async function unlikePost(userId: string, postId: string) {
  await db.like.delete({
    where: {
      feedPostId_userId: {
        feedPostId: postId,
        userId,
      },
    },
  })
}

export async function getPostComments(postId: string) {
  return db.comment.findMany({
    where: { feedPostId: postId },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  })
}

export async function addComment(userId: string, postId: string, content: string) {
  const post = await db.feedPost.findUnique({
    where: { id: postId },
    select: { userId: true },
  })

  if (!post) throw new Error('Post não encontrado')

  const comment = await db.comment.create({
    data: {
      userId,
      feedPostId: postId,
      content,
    },
    include: {
      user: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  })

  // Create notification if commenting on someone else's post
  if (post.userId !== userId) {
    await db.notification.create({
      data: {
        userId: post.userId,
        type: 'POST_COMMENTED',
        actorId: userId,
        postId,
      },
    })
  }

  return comment
}

export async function deleteComment(userId: string, commentId: string) {
  const comment = await db.comment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  })

  if (!comment) throw new Error('Comentário não encontrado')
  if (comment.userId !== userId) throw new Error('Você não pode excluir este comentário')

  await db.comment.delete({
    where: { id: commentId },
  })
}

export async function getUserNotifications(userId: string, limit = 50) {
  return db.notification.findMany({
    where: { userId },
    include: {
      actor: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
        },
      },
      post: {
        include: {
          userBook: {
            include: {
              book: {
                select: {
                  title: true,
                },
              },
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}

export async function markNotificationsAsRead(userId: string, notificationIds?: string[]) {
  await db.notification.updateMany({
    where: {
      userId,
      ...(notificationIds ? { id: { in: notificationIds } } : {}),
    },
    data: { read: true },
  })
}

export async function getUnreadNotificationCount(userId: string) {
  return db.notification.count({
    where: { userId, read: false },
  })
}
