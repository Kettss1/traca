'use client'

import { cn } from '@/lib/utils'

interface ReadingCalendarProps {
  data: Record<string, number>
  year: number
}

const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
const MONTHS = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']

export function ReadingCalendar({ data, year }: ReadingCalendarProps) {
  const startDate = new Date(year, 0, 1)
  const endDate = new Date(year, 11, 31)
  const days: { date: Date; value: number }[] = []

  const currentDate = new Date(startDate)
  while (currentDate <= endDate) {
    const dateKey = currentDate.toISOString().split('T')[0]
    days.push({
      date: new Date(currentDate),
      value: data[dateKey] || 0,
    })
    currentDate.setDate(currentDate.getDate() + 1)
  }

  const weeks: { date: Date; value: number }[][] = []
  let currentWeek: { date: Date; value: number }[] = []

  const firstDayOfWeek = days[0].date.getDay()
  for (let i = 0; i < firstDayOfWeek; i++) {
    currentWeek.push({ date: new Date(0), value: -1 })
  }

  days.forEach((day) => {
    currentWeek.push(day)
    if (currentWeek.length === 7) {
      weeks.push(currentWeek)
      currentWeek = []
    }
  })

  if (currentWeek.length > 0) {
    weeks.push(currentWeek)
  }

  // Build month labels: figure out which week each month starts at
  const monthStartWeeks: number[] = Array(12).fill(-1)
  weeks.forEach((week, weekIndex) => {
    const validDay = week.find((d) => d.value !== -1)
    if (validDay) {
      const month = validDay.date.getMonth()
      if (monthStartWeeks[month] === -1) {
        monthStartWeeks[month] = weekIndex
      }
    }
  })

  const getIntensityClass = (value: number): string => {
    if (value === -1) return 'bg-transparent'
    if (value === 0) return 'bg-cream-dark'
    if (value < 3) return 'bg-green-accent/25'
    if (value < 6) return 'bg-green-light/40'
    if (value < 10) return 'bg-green-deep/60'
    return 'bg-green-deep'
  }

  const GAP = 3
  const LABEL_WIDTH = 28
  const columns = `repeat(${weeks.length}, minmax(0, 1fr))`

  return (
    <div className="-mx-1 overflow-x-auto px-1 pb-1">
      {/* largura mínima só no celular; no desktop as células crescem até preencher o card */}
      <div className="min-w-[620px]">
        {/* Meses */}
        <div className="mb-1.5 flex" style={{ paddingLeft: LABEL_WIDTH }}>
          <div className="grid flex-1" style={{ gridTemplateColumns: columns, columnGap: GAP }}>
            {MONTHS.map((month, i) =>
              monthStartWeeks[i] === -1 ? null : (
                <span
                  key={month}
                  className="text-text-muted text-xs whitespace-nowrap"
                  style={{ gridColumnStart: monthStartWeeks[i] + 1, gridRow: 1 }}
                >
                  {month}
                </span>
              )
            )}
          </div>
        </div>

        <div className="flex">
          {/* Dias da semana */}
          <div className="grid shrink-0" style={{ width: LABEL_WIDTH, gridTemplateRows: 'repeat(7, minmax(0, 1fr))', rowGap: GAP }}>
            {WEEKDAYS.map((day, i) => (
              <span
                key={day}
                className="text-text-muted flex items-center text-[11px]"
                style={{ visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </span>
            ))}
          </div>

          {/* Grade */}
          <div className="grid flex-1" style={{ gridTemplateColumns: columns, columnGap: GAP }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="grid min-w-0" style={{ rowGap: GAP, gridTemplateColumns: "minmax(0, 1fr)" }}>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn('aspect-square w-full rounded-[3px]', getIntensityClass(day.value))}
                    title={
                      day.value >= 0
                        ? `${day.date.toLocaleDateString('pt-BR')}: ${day.value > 0 ? 'dia de leitura' : 'sem leitura'}`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legenda */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-text-muted text-xs">Menos</span>
          <div className="flex gap-1">
            <div className="bg-cream-dark h-3 w-3 rounded-[3px]" />
            <div className="bg-green-accent/25 h-3 w-3 rounded-[3px]" />
            <div className="bg-green-light/40 h-3 w-3 rounded-[3px]" />
            <div className="bg-green-deep/60 h-3 w-3 rounded-[3px]" />
            <div className="bg-green-deep h-3 w-3 rounded-[3px]" />
          </div>
          <span className="text-text-muted text-xs">Mais</span>
        </div>
      </div>
    </div>
  )
}
