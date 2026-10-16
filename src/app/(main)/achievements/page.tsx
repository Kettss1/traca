import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { getUserAchievements, getLeaderboard } from '@/lib/services/gamification'
import { AchievementCard } from '@/components/gamification/achievement-card'
import { PointsDisplay } from '@/components/gamification/points-display'
import { Leaderboard } from '@/components/gamification/leaderboard'

export const metadata = {
  title: 'Conquistas',
  description: 'Suas conquistas e ranking',
}

export default async function AchievementsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const [user, achievements, pointsLeaderboard, booksLeaderboard, pagesLeaderboard] =
    await Promise.all([
      db.user.findUnique({
        where: { id: session.user.id },
        select: { points: true, coins: true },
      }),
      getUserAchievements(session.user.id),
      getLeaderboard('points'),
      getLeaderboard('books'),
      getLeaderboard('pages'),
    ])

  const groupedAchievements = achievements.reduce(
    (acc, achievement) => {
      const category = achievement.category
      if (!acc[category]) {
        acc[category] = []
      }
      acc[category].push(achievement)
      return acc
    },
    {} as Record<string, typeof achievements>
  )

  const categoryLabels: Record<string, string> = {
    reading: 'Leitura',
    collection: 'Coleção',
    social: 'Social',
    streak: 'Sequência',
    points: 'Pontos',
    loyalty: 'Fidelidade',
  }

  const earnedCount = achievements.filter((a) => a.isEarned).length
  const totalCount = achievements.length

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-fraunces text-2xl font-bold text-text-dark">
            Conquistas
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {earnedCount} de {totalCount} desbloqueadas
          </p>
        </div>

        {user && <PointsDisplay points={user.points} coins={user.coins} />}
      </div>

      {/* Overall progress */}
      <div className="card p-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-muted">Progresso geral</span>
          <span className="tabular-nums font-medium text-green-deep">
            {totalCount > 0 ? Math.round((earnedCount / totalCount) * 100) : 0}%
          </span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-cream-dark">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-deep to-green-accent transition-all"
            style={{ width: `${totalCount > 0 ? (earnedCount / totalCount) * 100 : 0}%` }}
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_300px]">
        {/* Achievements */}
        <div className="space-y-6">
          {Object.entries(groupedAchievements).map(([category, categoryAchievements]) => (
            <div key={category}>
              <h2 className="section-title mb-3">
                {categoryLabels[category] || category}
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {categoryAchievements.map((achievement) => (
                  <AchievementCard
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    category={achievement.category}
                    points={achievement.points}
                    coins={achievement.coins}
                    isEarned={achievement.isEarned}
                    earnedAt={achievement.earnedAt}
                    progress={achievement.progress}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Leaderboard sidebar */}
        <div className="lg:sticky lg:top-20 lg:self-start">
          <Leaderboard
            pointsData={pointsLeaderboard}
            booksData={booksLeaderboard}
            pagesData={pagesLeaderboard}
          />
        </div>
      </div>
    </div>
  )
}
