import { useEffect, useState } from 'react'
import { settlementService } from '../services/settlementService.js'
import { useApp } from '../context/AppContext.jsx'
import SettlementRow from '../components/settlements/SettlementRow.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function SettlementPage() {
  const { formatAmount } = useApp()
  const [debts, setDebts] = useState([])
  const [settlements, setSettlements] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      settlementService.getSimplified(),
      settlementService.getAll(),
    ]).then(([debtRes, setRes]) => {
      setDebts(debtRes.data.data)
      setSettlements(setRes.data.data)
    }).finally(() => setLoading(false))
  }, [])

  const handleMarkPaid = async (debt) => {
    try {
      const res = await settlementService.create({
        toId: debt.to._id || debt.to,
        amount: debt.amount,
      })
      await settlementService.markAsPaid(res.data.data._id)
      setDebts(prev => prev.filter(d => d !== debt))
      toast.success('Marked as paid!')
    } catch {
      toast.error('Failed to mark as paid')
    }
  }

  const totalOutstanding = debts.reduce((s, d) => s + d.amount, 0)
  const completed = settlements.filter(s => s.status === 'completed')
  const pending = settlements.filter(s => s.status === 'pending')

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <h2 className="font-display font-semibold text-lg text-gray-800">Outstanding Settlements</h2>
        {debts.length === 0 ? (
          <EmptyState icon="🎉" title="All Settled Up!" description="No outstanding debts — you're all good!" />
        ) : debts.map((debt, i) => (
          <SettlementRow key={i} debt={debt} onMarkPaid={handleMarkPaid}
                         onReminder={() => toast.success('Reminder sent!')} />
        ))}
      </div>

      <div className="space-y-4">
        <div className="card">
          <h3 className="font-display font-semibold text-gray-800 mb-4">Summary</h3>
          <p className="text-3xl font-display font-bold text-primary">{formatAmount(totalOutstanding)}</p>
          <p className="text-sm text-gray-500 mt-1">{debts.length} pending transactions</p>
          <div className="mt-4 bg-wbg rounded-xl p-3 text-center">
            <p className="text-sm text-gray-600">
              {completed.length} of {settlements.length} settled
            </p>
            <div className="h-2 bg-gray-200 rounded-full mt-2 overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all"
                   style={{ width: `${settlements.length ? (completed.length / settlements.length) * 100 : 0}%` }} />
            </div>
          </div>
        </div>

        {completed.length > 0 && (
          <div className="card">
            <h3 className="font-display font-semibold text-gray-800 mb-3">Recent Settled</h3>
            <div className="space-y-2">
              {completed.slice(0, 5).map(s => (
                <div key={s._id} className="flex justify-between text-sm">
                  <span className="text-gray-600">{s.from?.name} → {s.to?.name}</span>
                  <span className="font-semibold text-green-600">{formatAmount(s.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
