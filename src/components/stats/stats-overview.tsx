import { Star } from '@phosphor-icons/react/dist/ssr'
import type { ReadingStats } from '@/lib/services/stats'

interface StatsOverviewProps {
  stats: ReadingStats
}

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
const num = new Intl.NumberFormat('pt-BR')

export function StatsOverview({ stats }: StatsOverviewProps) {
  // Dois números principais; o resto vira uma linha de apoio
  const secondary = [
    `${stats.totalBooks} na estante`,
    stats.pagesRead > 0 ? `${num.format(stats.pagesRead)} páginas lidas` : null,
    stats.totalSpent > 0 ? `${brl.format(stats.totalSpent)} em livros` : null,
    stats.totalRereads > 0 ? `${stats.totalRereads} ${stats.totalRereads === 1 ? 'releitura' : 'releituras'}` : null,
  ].filter(Boolean)

  return (
    <section className="card p-6" aria-label="Resumo">
      <div className="grid grid-cols-3 gap-4 sm:gap-6">
        <BigNumber value={num.format(stats.booksRead)} label={stats.booksRead === 1 ? 'livro lido' : 'livros lidos'} />
        <BigNumber value={`~${num.format(stats.estimatedHours)}h`} label="de leitura" />
        <div>
          <p className="font-fraunces text-text-dark flex items-baseline gap-2 text-3xl leading-none font-semibold tabular-nums sm:text-5xl">
            {stats.ratedBooks > 0 ? stats.averageRating.toLocaleString('pt-BR', { maximumFractionDigits: 1 }) : '–'}
            <Star className="text-terracotta h-5 w-5 self-center sm:h-7 sm:w-7" weight="fill" />
          </p>
          <p className="text-text-muted mt-2 text-xs sm:text-sm">
            nota média{stats.ratedBooks > 0 && ` · ${stats.ratedBooks} avaliados`}
          </p>
        </div>
      </div>
      <p className="border-line text-text-muted mt-6 border-t pt-4 text-sm">{secondary.join(' · ')}</p>
    </section>
  )
}

function BigNumber({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-fraunces text-green-deep text-3xl leading-none font-semibold tabular-nums sm:text-5xl">{value}</p>
      <p className="text-text-muted mt-2 text-xs sm:text-sm">{label}</p>
    </div>
  )
}
