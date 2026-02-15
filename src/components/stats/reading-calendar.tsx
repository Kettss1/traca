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

  // Each week column is 12px wide + 3px gap = 15px
  const CELL_SIZE = 12
  const GAP = 3
  const STEP = CELL_SIZE + GAP
  const LABEL_WIDTH = 28

  return (
    <div className="overflow-x-auto">
      <div style={{ minWidth: `${LABEL_WIDTH + weeks.length * STEP}px` }}>
        {/* Month labels row */}
        <div className="relative mb-1" style={{ marginLeft: `${LABEL_WIDTH + GAP}px`, height: '16px' }}>
          {MONTHS.map((month, i) => {
            if (monthStartWeeks[i] === -1) return null
            return (
              <span
                key={month}
                className="absolute text-[11px] text-text-muted"
                style={{ left: `${monthStartWeeks[i] * STEP}px` }}
              >
                {month}
              </span>
            )
          })}
        </div>

        {/* Grid area: weekday labels + cells */}
        <div className="flex">
          {/* Weekday labels */}
          <div className="flex flex-col" style={{ width: `${LABEL_WIDTH}px`, gap: `${GAP}px` }}>
            {WEEKDAYS.map((day, i) => (
              <div
                key={day}
                className="flex items-center text-[10px] text-text-muted"
                style={{ height: `${CELL_SIZE}px`, visibility: i % 2 === 1 ? 'visible' : 'hidden' }}
              >
                {day}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="flex" style={{ gap: `${GAP}px` }}>
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                {week.map((day, dayIndex) => (
                  <div
                    key={dayIndex}
                    className={cn(
                      'rounded-sm',
                      getIntensityClass(day.value)
                    )}
                    style={{ width: `${CELL_SIZE}px`, height: `${CELL_SIZE}px` }}
                    title={
                      day.value >= 0
                        ? `${day.date.toLocaleDateString('pt-BR')}: ${day.value > 0 ? `${day.value} atividades` : 'Sem atividade'}`
                        : undefined
                    }
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center justify-end gap-2">
          <span className="text-[11px] text-text-muted">Menos</span>
          <div className="flex gap-1">
            <div className="h-3 w-3 rounded-sm bg-cream-dark" />
            <div className="h-3 w-3 rounded-sm bg-green-accent/25" />
            <div className="h-3 w-3 rounded-sm bg-green-light/40" />
            <div className="h-3 w-3 rounded-sm bg-green-deep/60" />
            <div className="h-3 w-3 rounded-sm bg-green-deep" />
          </div>
          <span className="text-[11px] text-text-muted">Mais</span>
        </div>
      </div>
    </div>
  )
}
