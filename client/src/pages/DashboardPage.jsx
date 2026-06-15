import { useEffect, useState } from 'react'
import { FiDollarSign, FiShoppingBag, FiGrid, FiClock } from 'react-icons/fi'
import { expenseService } from '../services/expenseService.js'
import { groupService } from '../services/groupService.js'
import { reportService } from '../services/reportService.js'
import { useApp } from '../context/AppContext.jsx'
import StatCard from '../components/dashboard/StatCard.jsx'
import BalanceCard from '../components/dashboard/BalanceCard.jsx'
import ActivityFeed from '../components/dashboard/ActivityFeed.jsx'
import QuickActions from '../components/dashboard/QuickActions.jsx'
import SpendingPieChart from '../components/charts/SpendingPieChart.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

export default function DashboardPage() {
  const { formatAmount } = useApp()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState(null)
  const [groups, setGroups] = useState([])
  const [expenses, setExpenses] = useState([])
  const [categoryData, setCategoryData] = useState([])

  useEffect(() => {
    const load = async () => {
      try {
        const [sumRes, groupsRes, expRes, catRes] = await Promise.all([
          expenseService.getSummary('month'),
          groupService.getAll(),
          expenseService.getAll({ limit: 5 }),
          reportService.getByCategory('month'),
        ])
        setSummary(sumRes.data.data)
        setGroups(groupsRes.data.data)
        setExpenses(expRes.data.data)
        setCategoryData(catRes.data.data)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-64" />
      </div>
    )
  }

  const net = summary?.netBalance || 0

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Balance" value={formatAmount(net)}
                  icon={FiDollarSign} color={net >= 0 ? 'green' : 'red'} />
        <StatCard label="Total Expenses" value={formatAmount(summary?.totalExpenses || 0)}
                  icon={FiShoppingBag} color="primary" />
        <StatCard label="Total Groups" value={groups.length} icon={FiGrid} color="primary" />
        <StatCard label="Pending Settlements" value={summary?.pendingSettlements || 0}
                  icon={FiClock} color="amber" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <BalanceCard emoji="🔴" label="You Owe" amount={summary?.youOwe || 0}
                     subtext="to others" bg="bg-red-50" />
        <BalanceCard emoji="🟢" label="You Are Owed" amount={summary?.youAreOwed || 0}
                     subtext="from others" bg="bg-green-50" />
        <BalanceCard emoji="🔵" label="Net Balance" amount={net}
                     subtext={net >= 0 ? 'positive' : 'negative'} bg="bg-blue-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
          <ActivityFeed expenses={expenses} />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <QuickActions />
          <div className="card">
            <h3 className="font-display font-semibold text-gray-800 mb-4">Spending Overview</h3>
            <SpendingPieChart data={categoryData} height={192} />
          </div>
        </div>
      </div>
    </div>
  )
}
