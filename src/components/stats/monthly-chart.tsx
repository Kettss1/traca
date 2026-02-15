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
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f5ebd6" />
        <XAxis
          dataKey="month"
          tick={{ fontSize: 12, fill: '#6b5d4d' }}
          axisLine={{ stroke: '#f5ebd6' }}
          tickLine={false}
        />
        <YAxis
          allowDecimals={false}
          tick={{ fontSize: 12, fill: '#6b5d4d' }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          formatter={(value, name) => {
            if (name === 'booksFinished') return [`${value} livros`, 'Livros finalizados']
            return [String(value), String(name)]
          }}
          contentStyle={{
            backgroundColor: '#fdf6e9',
            border: '1px solid #f5ebd6',
            borderRadius: '12px',
            fontSize: '13px',
          }}
        />
        <Bar
          dataKey="booksFinished"
          fill="#115e59"
          radius={[6, 6, 0, 0]}
          maxBarSize={40}
        />
      </BarChart>
    </ResponsiveContainer>
  )
}
