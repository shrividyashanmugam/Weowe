import { useEffect, useState } from 'react'
import { FiTrendingUp, FiTrendingDown } from 'react-icons/fi'
import { reportService } from '../services/reportService.js'
import { useApp } from '../context/AppContext.jsx'
import SpendingPieChart from '../components/charts/SpendingPieChart.jsx'
import MonthlyBarChart from '../components/charts/MonthlyBarChart.jsx'
import TrendLineChart from '../components/charts/TrendLineChart.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

const PERIODS = [
  { id: 'month', label: 'This Month' },
  { id: '3months', label: '3 Months' },
  { id: '6months', label: '6 Months' },
  { id: 'year', label: 'This Year' },
]

export default function ReportsPage() {
  const { formatAmount } = useApp()
  const [period, setPeriod] = useState('month')
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [topSpenders, setTopSpenders] = useState([])

  useEffect(() => {
    setLoading(true)
    Promise.all([
      reportService.getSummary(period),
      reportService.getByCategory(period),
      reportService.getMonthlyTrend(6),
      reportService.getTopSpenders(),
    ]).then(([sumRes, catRes, monthRes, topRes]) => {
      setSummary(sumRes.data.data)
      setCategoryData(catRes.data.data)
      setMonthlyData(monthRes.data.data)
      setTopSpenders(topRes.data.data)
    }).finally(() => setLoading(false))
  }, [period])

  if (loading) return <Skeleton className="h-96" />

  const change = summary?.percentageChange || 0

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {PERIODS.map(p => (
          <button key={p.id} onClick={() => setPeriod(p.id)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all
                    ${period === p.id ? 'bg-primary text-white' : 'bg-white text-gray-600 hover:bg-wbg'}`}>
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card">
          <p className="text-xs text-gray-500">Total This Period</p>
          <p className="font-display font-bold text-xl">{formatAmount(summary?.totalThisPeriod || 0)}</p>
          <div className={`flex items-center gap-1 text-xs mt-1 ${change >= 0 ? 'text-red-500' : 'text-green-500'}`}>
            {change >= 0 ? <FiTrendingUp size={14} /> : <FiTrendingDown size={14} />}
            {Math.abs(change)}% vs last period
          </div>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Expense Count</p>
          <p className="font-display font-bold text-xl">{summary?.expenseCount || 0}</p>
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Top Category</p>
          <p className="font-display font-bold text-lg">{summary?.topCategory?.name || '—'}</p>
          {summary?.topCategory && <p className="text-xs text-gray-500">{formatAmount(summary.topCategory.amount)}</p>}
        </div>
        <div className="card">
          <p className="text-xs text-gray-500">Top Spender</p>
          {summary?.topSpender ? (
            <div className="flex items-center gap-2 mt-1">
              <Avatar src={summary.topSpender.avatar} name={summary.topSpender.name} size="sm" />
              <div>
                <p className="font-semibold text-sm">{summary.topSpender.name}</p>
                <p className="text-xs text-gray-500">{formatAmount(summary.topSpender.amount)}</p>
              </div>
            </div>
          ) : <p className="font-bold text-lg">—</p>}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="card">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Spending by Category</h3>
          <SpendingPieChart data={categoryData} height={220} />
        </div>
        <div className="card">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Monthly Spending</h3>
          <MonthlyBarChart data={monthlyData} height={220} />
        </div>
        <div className="card">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Spending Trend</h3>
          <TrendLineChart data={monthlyData} height={220} />
        </div>
      </div>

      <div className="card">
        <h3 className="font-display font-semibold text-gray-800 mb-4">Top Spenders</h3>
        <div className="space-y-4">
          {topSpenders.map((s, i) => {
            const max = topSpenders[0]?.total || 1
            return (
              <div key={i} className="flex items-center gap-4">
                <Avatar src={s.avatar} name={s.name} size="md" />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium">{s.name}</span>
                    <span className="text-sm font-semibold text-primary">{formatAmount(s.total)}</span>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-primary rounded-full" style={{ width: `${(s.total / max) * 100}%` }} />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
