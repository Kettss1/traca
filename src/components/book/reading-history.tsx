import { Star } from '@phosphor-icons/react/dist/ssr'

interface Reading {
  id: string
  rating: number | null
  startDate: Date | null
  finishDate: Date | null
  isReread: boolean
  createdAt: Date
}

interface ReadingHistoryProps {
  readings: Reading[]
}

export function ReadingHistory({ readings }: ReadingHistoryProps) {
  if (readings.length <= 1) return null

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-text-dark">
        Histórico de Leituras ({readings.length})
      </h3>

      <div className="space-y-2">
        {readings.map((reading, index) => (
          <div
            key={reading.id}
            className="flex items-center justify-between rounded-lg bg-cream-dark/50 px-3 py-2 text-sm"
          >
            <div className="flex items-center gap-2">
              <span className="font-medium text-text-dark">
                {readings.length - index}ª leitura
              </span>
              {reading.rating && (
                <span className="flex items-center gap-0.5 text-terracotta">
                  <Star className="h-3 w-3" weight="fill" />
                  {reading.rating.toFixed(1)}
                </span>
              )}
            </div>
            <div className="text-text-muted">
              {reading.finishDate ? (
                <span>
                  Concluído em{' '}
                  {new Date(reading.finishDate).toLocaleDateString('pt-BR', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ) : reading.startDate ? (
                <span>
                  Iniciado em{' '}
                  {new Date(reading.startDate).toLocaleDateString('pt-BR', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              ) : (
                <span>
                  Adicionado em{' '}
                  {new Date(reading.createdAt).toLocaleDateString('pt-BR', {
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
