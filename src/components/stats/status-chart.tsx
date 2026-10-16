'use client'

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'

interface StatusChartProps {
  data: { name: string; value: number; color: string }[]
}

export function StatusChart({ data }: StatusChartProps) {
  const filteredData = data.filter((d) => d.value > 0)
  const total = filteredData.reduce((sum, d) => sum + d.value, 0)

  if (filteredData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-text-muted">
        Nenhum dado disponível
      </div>
    )
  }

  return (
    <div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={filteredData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={0}
          >
            {filteredData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(value) => [`${value} livros`, 'Quantidade']}
            contentStyle={{
              backgroundColor: 'var(--surface)',
              border: '1px solid var(--line)',
              borderRadius: '12px',
              fontSize: '13px',
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {filteredData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-1.5">
            <div
              className="h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-text-muted">
              {entry.name}{' '}
              <span className="font-medium text-text-dark">
                {entry.value}
              </span>
              <span className="text-text-muted/60">
                {' '}({Math.round((entry.value / total) * 100)}%)
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}
