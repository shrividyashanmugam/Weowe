import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext.jsx'

export default function SpendingPieChart({ data = [], height = 200 }) {
  const { formatAmount } = useApp()
  const total = data.reduce((s, d) => s + d.value, 0)

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={4}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || '#636E72'} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatAmount(v)} />
        </PieChart>
      </ResponsiveContainer>
      {total > 0 && (
        <p className="text-center text-sm text-gray-500 mt-2">Total: {formatAmount(total)}</p>
      )}
      <div className="flex flex-wrap gap-2 justify-center mt-3">
        {data.map(d => (
          <span key={d.name} className="flex items-center gap-1 text-xs text-gray-600">
            <span className="w-2 h-2 rounded-full" style={{ background: d.color }} />
            {d.name}
          </span>
        ))}
      </div>
    </div>
  )
}
