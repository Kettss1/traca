import { Books, BookOpen, Clock, CurrencyDollar, Star, ArrowClockwise } from '@phosphor-icons/react/dist/ssr'
import type { ReadingStats } from '@/lib/services/stats'

interface StatsOverviewProps {
  stats: ReadingStats
}

export function StatsOverview({ stats }: StatsOverviewProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <StatCard
        icon={Books}
        label="Total de Livros"
        value={stats.totalBooks}
        iconColor="text-green-deep"
        iconBg="bg-green-deep/10"
      />
      <StatCard
        icon={BookOpen}
        label="Livros Lidos"
        value={stats.booksRead}
        iconColor="text-green-light"
        iconBg="bg-green-light/10"
      />
      <StatCard
        icon={Clock}
        label="Horas de Leitura"
        value={`~${stats.estimatedHours}h`}
        iconColor="text-terracotta"
        iconBg="bg-terracotta/10"
      />
      <StatCard
        icon={Star}
        label="Avaliação Média"
        value={stats.ratedBooks > 0 ? stats.averageRating.toFixed(1) : '-'}
        subtitle={stats.ratedBooks > 0 ? `${stats.ratedBooks} avaliados` : undefined}
        iconColor="text-terracotta-light"
        iconBg="bg-terracotta-light/10"
      />
      <StatCard
        icon={CurrencyDollar}
        label="Valor Total"
        value={new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          maximumFractionDigits: 0,
        }).format(stats.totalSpent)}
        iconColor="text-brown"
        iconBg="bg-brown/10"
      />
      <StatCard
        icon={ArrowClockwise}
        label="Releituras"
        value={stats.totalRereads}
        iconColor="text-green-accent"
        iconBg="bg-green-accent/10"
      />
    </div>
  )
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtitle,
  iconColor,
  iconBg,
}: {
  icon: typeof Books
  label: string
  value: string | number
  subtitle?: string
  iconColor: string
  iconBg: string
}) {
  return (
    <div className="rounded-2xl border border-cream-dark/80 bg-cream-dark/20 p-4">
      <div className={`inline-flex rounded-xl p-2 ${iconBg}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} weight="fill" />
      </div>
      <p className="mt-3 text-2xl font-bold tabular-nums text-text-dark">{value}</p>
      <p className="mt-0.5 text-xs text-text-muted">{label}</p>
      {subtitle && <p className="text-[11px] text-text-muted">{subtitle}</p>}
    </div>
  )
}
