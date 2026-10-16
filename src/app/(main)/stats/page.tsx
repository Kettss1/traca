import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import {
  getUserReadingStats,
  getUserAuthorStats,
  getUserPublisherStats,
  getUserMonthlyStats,
  getUserReadingGoal,
  getReadingCalendarData,
} from '@/lib/services/stats'
import { StatsOverview } from '@/components/stats/stats-overview'
import { StatusChart } from '@/components/stats/status-chart'
import { AuthorChart } from '@/components/stats/author-chart'
import { MonthlyChart } from '@/components/stats/monthly-chart'
import { ReadingGoalCard } from '@/components/stats/reading-goal-card'
import { ReadingCalendar } from '@/components/stats/reading-calendar'
import { RetrospectiveBanner } from '@/components/stats/retrospective-banner'

export const metadata = {
  title: 'Estatísticas',
  description: 'Suas estatísticas de leitura',
}

export default async function StatsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect('/login')
  }

  const currentYear = new Date().getFullYear()

  const [stats, authorStats, publisherStats, monthlyStats, readingGoal, calendarData] =
    await Promise.all([
      getUserReadingStats(session.user.id),
      getUserAuthorStats(session.user.id),
      getUserPublisherStats(session.user.id),
      getUserMonthlyStats(session.user.id, currentYear),
      getUserReadingGoal(session.user.id, currentYear),
      getReadingCalendarData(session.user.id, currentYear),
    ])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-fraunces text-2xl font-bold text-text-dark">
          Estatísticas
        </h1>
        <p className="mt-1 text-sm text-text-muted">
          Acompanhe seu progresso de leitura
        </p>
      </div>

      {/* Retrospective banner */}
      <RetrospectiveBanner year={currentYear} hasData={stats.booksRead > 0} />

      {/* Overview cards */}
      <StatsOverview stats={stats} />

      {/* Reading Goal */}
      <ReadingGoalCard goal={readingGoal} year={currentYear} />

      {/* Charts grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5">
          <h2 className="section-title mb-4">
            Distribuição por status
          </h2>
          <StatusChart
            data={[
              { name: 'Lidos', value: stats.booksRead, color: 'var(--green-deep)' },
              { name: 'Lendo', value: stats.booksReading, color: 'var(--green-accent)' },
              { name: 'Quero Ler', value: stats.booksWantToRead, color: 'var(--terracotta)' },
              { name: 'Abandonados', value: stats.booksAbandoned, color: 'var(--text-muted)' },
            ]}
          />
        </div>

        <div className="card p-5">
          <h2 className="section-title mb-4">
            Autores mais lidos
          </h2>
          <AuthorChart data={authorStats} />
        </div>
      </div>

      {/* Monthly reading */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          Livros por mês ({currentYear})
        </h2>
        <MonthlyChart data={monthlyStats} />
      </div>

      {/* Reading calendar */}
      <div className="card p-5">
        <h2 className="section-title mb-4">
          Calendário de leitura ({currentYear})
        </h2>
        <ReadingCalendar data={calendarData} year={currentYear} />
      </div>

      {/* Publishers */}
      {publisherStats.length > 0 && (
        <div className="card p-5">
          <h2 className="section-title mb-4">
            Editoras mais lidas
          </h2>
          <div className="space-y-3">
            {publisherStats.slice(0, 5).map((publisher, index) => (
              <div key={publisher.name} className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-green-deep/10 text-xs font-bold text-green-deep">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-text-dark">
                      {publisher.name}
                    </span>
                    <span className="text-sm tabular-nums text-text-muted">
                      {publisher.count} {publisher.count === 1 ? 'livro' : 'livros'}
                    </span>
                  </div>
                  <div className="mt-1.5 h-1.5 rounded-full bg-cream-dark">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-green-deep to-green-light transition-all"
                      style={{
                        width: `${(publisher.count / publisherStats[0].count) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
