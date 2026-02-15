import { db } from '@/lib/db'
import type { PointsAction } from '@/generated/prisma'

// Points awarded for each action
const POINTS_CONFIG: Record<PointsAction, number> = {
  BOOK_ADDED: 10,
  BOOK_FINISHED: 50,
  BOOK_RATED: 15,
  BOOK_REVIEWED: 25,
  ANNOTATION_CREATED: 10,
  QUOTE_SHARED: 15,
  FIRST_FOLLOWER: 20,
  ACHIEVEMENT_EARNED: 0, // Points come from achievement itself
  DAILY_LOGIN: 5,
  STREAK_BONUS: 10,
}

export async function awardPoints(
  userId: string,
  action: PointsAction,
  options?: {
    description?: string
    referenceId?: string
    customPoints?: number
  }
) {
  const points = options?.customPoints ?? POINTS_CONFIG[action]

  if (points <= 0) return

  await db.$transaction([
    // Add points to user
    db.user.update({
      where: { id: userId },
      data: { points: { increment: points } },
    }),
    // Log the points transaction
    db.pointsLog.create({
      data: {
        userId,
        action,
        points,
        description: options?.description,
        referenceId: options?.referenceId,
      },
    }),
  ])

  // Check for achievements after awarding points
  await checkAchievements(userId)
}

export async function awardCoins(userId: string, coins: number, reason?: string) {
  if (coins <= 0) return

  await db.user.update({
    where: { id: userId },
    data: { coins: { increment: coins } },
  })
}

export async function spendCoins(userId: string, coins: number): Promise<boolean> {
  const user = await db.user.findUnique({
    where: { id: userId },
    select: { coins: true },
  })

  if (!user || user.coins < coins) {
    return false
  }

  await db.user.update({
    where: { id: userId },
    data: { coins: { decrement: coins } },
  })

  return true
}

export async function checkAchievements(userId: string) {
  const achievements = await db.achievement.findMany()
  const userStats = await getUserStats(userId)

  for (const achievement of achievements) {
    const requirement = achievement.requirement as Record<string, number>
    const isEarned = await checkRequirement(userId, requirement, userStats)

    if (isEarned) {
      await grantAchievement(userId, achievement.id, achievement.points, achievement.coins)
    }
  }
}

async function getUserStats(userId: string) {
  const [
    booksCount,
    booksReadCount,
    pagesRead,
    followersCount,
    followingCount,
    annotationsCount,
    quotesSharedCount,
    user,
  ] = await Promise.all([
    db.userBook.count({ where: { userId } }),
    db.userBook.count({ where: { userId, status: 'READ' } }),
    db.userBook.aggregate({
      where: { userId, status: 'READ' },
      _sum: { currentPage: true },
    }),
    db.follow.count({ where: { followingId: userId } }),
    db.follow.count({ where: { followerId: userId } }),
    db.annotation.count({
      where: { userBook: { userId }, deletedAt: null },
    }),
    db.feedPost.count({
      where: { userId, type: 'QUOTE_SHARED' },
    }),
    db.user.findUnique({
      where: { id: userId },
      select: { points: true, createdAt: true },
    }),
  ])

  // Calculate reading streak (books finished in consecutive weeks)
  const recentBooks = await db.userBook.findMany({
    where: { userId, status: 'READ', finishDate: { not: null } },
    orderBy: { finishDate: 'desc' },
    take: 30,
  })

  let streak = 0
  let lastWeek = -1
  for (const book of recentBooks) {
    if (book.finishDate) {
      const weekNum = getWeekNumber(book.finishDate)
      if (lastWeek === -1 || weekNum === lastWeek - 1) {
        streak++
        lastWeek = weekNum
      } else {
        break
      }
    }
  }

  // Calculate account age in days
  const accountAgeDays = user
    ? Math.floor((Date.now() - user.createdAt.getTime()) / (1000 * 60 * 60 * 24))
    : 0

  return {
    booksCount,
    booksReadCount,
    pagesRead: pagesRead._sum.currentPage || 0,
    followersCount,
    followingCount,
    annotationsCount,
    quotesSharedCount,
    points: user?.points || 0,
    streak,
    accountAgeDays,
  }
}

function getWeekNumber(date: Date): number {
  const startOfYear = new Date(date.getFullYear(), 0, 1)
  const diff = date.getTime() - startOfYear.getTime()
  return Math.floor(diff / (7 * 24 * 60 * 60 * 1000))
}

async function checkRequirement(
  userId: string,
  requirement: Record<string, number>,
  stats: Awaited<ReturnType<typeof getUserStats>>
): Promise<boolean> {
  for (const [key, value] of Object.entries(requirement)) {
    switch (key) {
      case 'booksRead':
        if (stats.booksReadCount < value) return false
        break
      case 'booksAdded':
        if (stats.booksCount < value) return false
        break
      case 'pagesRead':
        if (stats.pagesRead < value) return false
        break
      case 'followers':
        if (stats.followersCount < value) return false
        break
      case 'following':
        if (stats.followingCount < value) return false
        break
      case 'annotations':
        if (stats.annotationsCount < value) return false
        break
      case 'quotesShared':
        if (stats.quotesSharedCount < value) return false
        break
      case 'points':
        if (stats.points < value) return false
        break
      case 'streak':
        if (stats.streak < value) return false
        break
      case 'accountAgeDays':
        if (stats.accountAgeDays < value) return false
        break
    }
  }
  return true
}

async function grantAchievement(
  userId: string,
  achievementId: string,
  points: number,
  coins: number
) {
  // Check if already earned
  const existing = await db.userAchievement.findUnique({
    where: {
      userId_achievementId: { userId, achievementId },
    },
  })

  if (existing?.earnedAt) return // Already earned

  await db.$transaction([
    // Update or create user achievement
    db.userAchievement.upsert({
      where: {
        userId_achievementId: { userId, achievementId },
      },
      create: {
        userId,
        achievementId,
        progress: 100,
        earnedAt: new Date(),
      },
      update: {
        progress: 100,
        earnedAt: new Date(),
      },
    }),
    // Award points
    ...(points > 0
      ? [
          db.user.update({
            where: { id: userId },
            data: { points: { increment: points } },
          }),
          db.pointsLog.create({
            data: {
              userId,
              action: 'ACHIEVEMENT_EARNED',
              points,
              referenceId: achievementId,
            },
          }),
        ]
      : []),
    // Award coins
    ...(coins > 0
      ? [
          db.user.update({
            where: { id: userId },
            data: { coins: { increment: coins } },
          }),
        ]
      : []),
  ])
}

export async function getUserAchievements(userId: string) {
  const userAchievements = await db.userAchievement.findMany({
    where: { userId },
    include: { achievement: true },
  })

  const allAchievements = await db.achievement.findMany({
    where: { isSecret: false },
  })

  // Map earned achievements
  const earnedMap = new Map(
    userAchievements.map((ua) => [ua.achievementId, ua])
  )

  return allAchievements.map((achievement) => {
    const userAchievement = earnedMap.get(achievement.id)
    return {
      ...achievement,
      progress: userAchievement?.progress || 0,
      earnedAt: userAchievement?.earnedAt || null,
      isEarned: !!userAchievement?.earnedAt,
    }
  })
}

export async function getEarnedBadges(userId: string) {
  return db.userAchievement.findMany({
    where: { userId, earnedAt: { not: null } },
    include: { achievement: true },
    orderBy: { earnedAt: 'desc' },
    take: 6,
  })
}

export async function getLeaderboard(
  type: 'points' | 'books' | 'pages' = 'points',
  limit = 10
) {
  if (type === 'points') {
    return db.user.findMany({
      where: { points: { gt: 0 } },
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        points: true,
      },
      orderBy: { points: 'desc' },
      take: limit,
    })
  }

  if (type === 'books') {
    const users = await db.user.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        avatarUrl: true,
        _count: {
          select: { userBooks: { where: { status: 'READ' } } },
        },
      },
      orderBy: {
        userBooks: { _count: 'desc' },
      },
      take: limit,
    })

    return users.map((u) => ({
      id: u.id,
      username: u.username,
      name: u.name,
      avatarUrl: u.avatarUrl,
      booksRead: u._count.userBooks,
    }))
  }

  // Pages read leaderboard
  const usersWithPages = await db.userBook.groupBy({
    by: ['userId'],
    where: { status: 'READ' },
    _sum: { currentPage: true },
    orderBy: { _sum: { currentPage: 'desc' } },
    take: limit,
  })

  const userIds = usersWithPages.map((u) => u.userId)
  const users = await db.user.findMany({
    where: { id: { in: userIds } },
    select: {
      id: true,
      username: true,
      name: true,
      avatarUrl: true,
    },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))

  return usersWithPages.map((up) => {
    const user = userMap.get(up.userId)
    return {
      id: user?.id || up.userId,
      username: user?.username || null,
      name: user?.name || null,
      avatarUrl: user?.avatarUrl || null,
      pagesRead: up._sum.currentPage || 0,
    }
  })
}

export async function getUserPointsHistory(userId: string, limit = 20) {
  return db.pointsLog.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })
}
