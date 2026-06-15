import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useApp } from '../../context/AppContext.jsx'

export default function TrendLineChart({ data = [], height = 250 }) {
  const { formatAmount } = useApp()

  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#1A6B6B" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#1A6B6B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="month" tick={{ fontSize: 11 }} />
          <YAxis tickFormatter={v => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => formatAmount(v)} />
          <Area type="monotone" dataKey="amount" stroke="#2E8B8B" strokeWidth={2.5}
                fill="url(#trendGradient)" activeDot={{ r: 6, fill: '#1A6B6B' }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}
