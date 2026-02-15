import { db } from '@/lib/db'

export interface UserProfile {
  id: string
  username: string | null
  name: string | null
  avatarUrl: string | null
  bio: string | null
  followersCount: number
  followingCount: number
  booksRead: number
  isFollowing: boolean
}

export async function getUserProfile(
  username: string,
  currentUserId?: string
): Promise<UserProfile | null> {
  const user = await db.user.findUnique({
    where: { username },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      _count: {
        select: {
          followers: true,
          following: true,
          userBooks: {
            where: { status: 'READ' },
          },
        },
      },
    },
  })

  if (!user) return null

  let isFollowing = false
  if (currentUserId && currentUserId !== user.id) {
    const follow = await db.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: user.id,
        },
      },
    })
    isFollowing = !!follow
  }

  return {
    id: user.id,
    username: user.username,
    name: user.name,
    avatarUrl: user.avatarUrl,
    bio: user.bio,
    followersCount: user._count.followers,
    followingCount: user._count.following,
    booksRead: user._count.userBooks,
    isFollowing,
  }
}

export async function followUser(followerId: string, followingId: string) {
  if (followerId === followingId) {
    throw new Error('Você não pode seguir a si mesmo')
  }

  await db.follow.create({
    data: {
      followerId,
      followingId,
    },
  })

  // Create notification
  await db.notification.create({
    data: {
      userId: followingId,
      type: 'NEW_FOLLOWER',
      actorId: followerId,
    },
  })
}

export async function unfollowUser(followerId: string, followingId: string) {
  await db.follow.delete({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })
}

export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const follow = await db.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId,
        followingId,
      },
    },
  })
  return !!follow
}

export async function getFollowers(userId: string, currentUserId?: string) {
  const followers = await db.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Check if current user follows each follower
  const followerIds = followers.map((f) => f.follower.id)
  const currentUserFollows = currentUserId
    ? await db.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: followerIds },
        },
      })
    : []
  const followingSet = new Set(currentUserFollows.map((f) => f.followingId))

  return followers.map((f) => ({
    ...f.follower,
    isFollowing: followingSet.has(f.follower.id),
  }))
}

export async function getFollowing(userId: string, currentUserId?: string) {
  const following = await db.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          username: true,
          name: true,
          avatarUrl: true,
          bio: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  // Check if current user follows each user
  const followingIds = following.map((f) => f.following.id)
  const currentUserFollows = currentUserId
    ? await db.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: followingIds },
        },
      })
    : []
  const followingSet = new Set(currentUserFollows.map((f) => f.followingId))

  return following.map((f) => ({
    ...f.following,
    isFollowing: followingSet.has(f.following.id),
  }))
}

export async function searchUsers(query: string, currentUserId?: string, limit = 20) {
  const users = await db.user.findMany({
    where: {
      OR: [
        { username: { contains: query, mode: 'insensitive' } },
        { name: { contains: query, mode: 'insensitive' } },
      ],
      NOT: currentUserId ? { id: currentUserId } : undefined,
    },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
      bio: true,
      _count: {
        select: {
          userBooks: { where: { status: 'READ' } },
        },
      },
    },
    take: limit,
  })

  // Check if current user follows each user
  const userIds = users.map((u) => u.id)
  const currentUserFollows = currentUserId
    ? await db.follow.findMany({
        where: {
          followerId: currentUserId,
          followingId: { in: userIds },
        },
      })
    : []
  const followingSet = new Set(currentUserFollows.map((f) => f.followingId))

  return users.map((u) => ({
    id: u.id,
    username: u.username,
    name: u.name,
    avatarUrl: u.avatarUrl,
    bio: u.bio,
    booksRead: u._count.userBooks,
    isFollowing: followingSet.has(u.id),
  }))
}
