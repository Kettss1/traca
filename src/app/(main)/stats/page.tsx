import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'
import {
  getUserReadingStats,
  getUserAuthorStats,
  getUserPublisherStats,
  getUserCategoryStats,
  getUserMonthlyStats,
  getUserReadingGoal,
  getReadingCalendarData,
} from '@/lib/services/stats'
import { StatsOverview } from '@/components/stats/stats-overview'
import { RankedList } from '@/components/stats/ranked-list'
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

  const [stats, authorStats, publisherStats, categoryStats, monthlyStats, readingGoal, calendarData] =
    await Promise.all([
      getUserReadingStats(session.user.id),
      getUserAuthorStats(session.user.id),
      getUserPublisherStats(session.user.id),
      getUserCategoryStats(session.user.id),
      getUserMonthlyStats(session.user.id, currentYear),
      getUserReadingGoal(session.user.id, currentYear),
      getReadingCalendarData(session.user.id, currentYear),
    ])

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="font-fraunces text-text-dark text-3xl font-bold">Estatísticas</h1>
        <p className="text-text-muted mt-1">Seu ritmo de leitura em {currentYear}</p>
      </div>

      <StatsOverview stats={stats} />

      <ReadingGoalCard goal={readingGoal} year={currentYear} />

      <RetrospectiveBanner year={currentYear} hasData={stats.booksRead > 0} />

      <section className="card p-5">
        <h2 className="section-title mb-4">Livros terminados por mês</h2>
        <MonthlyChart data={monthlyStats} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className="card p-5">
          <h2 className="section-title mb-4">Autores mais lidos</h2>
          <RankedList data={authorStats} emptyLabel="Nenhum autor registrado ainda" />
        </section>
        <section className="card p-5">
          <h2 className="section-title mb-4">Gêneros</h2>
          <RankedList data={categoryStats} emptyLabel="Os gêneros aparecem quando os livros têm categoria" />
        </section>
      </div>

      <section className="card p-5">
        <h2 className="section-title mb-4">Calendário de leitura</h2>
        <ReadingCalendar data={calendarData} year={currentYear} />
      </section>

      {/* com uma ou duas editoras a lista não diz nada */}
      {publisherStats.length >= 3 && (
        <section className="card p-5">
          <h2 className="section-title mb-4">Editoras mais lidas</h2>
          <RankedList data={publisherStats} emptyLabel="" />
        </section>
      )}
    </div>
  )
}
