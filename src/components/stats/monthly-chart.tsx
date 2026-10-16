'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import type { MonthlyStats } from '@/lib/services/stats'

interface MonthlyChartProps {
  data: MonthlyStats[]
}

export function MonthlyChart({ data }: MonthlyChartProps) {
  const hasData = data.some((d) => d.booksFinished > 0)

  if (!hasData) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        Nenhum livro finalizado este ano ainda
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--line)" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          axisLine={{ stroke: 'var(--line)' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: 'var(--text-muted)' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'booksFinished') return [`${value} livros`, 'Livros finalizados']
            return [String(value), String(name)]
          }}
          contentStyle={{
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--line)',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Bar
          dataKey="booksFinished"
          fill="var(--green-deep)"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
