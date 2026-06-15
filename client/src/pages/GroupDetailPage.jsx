import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { groupService } from '../services/groupService.js'
import { expenseService } from '../services/expenseService.js'
import { settlementService } from '../services/settlementService.js'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Tabs from '../components/ui/Tabs.jsx'
import ExpenseCard from '../components/expenses/ExpenseCard.jsx'
import SettlementRow from '../components/settlements/SettlementRow.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

export default function GroupDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const { formatAmount } = useApp()
  const navigate = useNavigate()
  const [group, setGroup] = useState(null)
  const [balances, setBalances] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [debts, setDebts] = useState([])
  const [tab, setTab] = useState('expenses')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      try {
        const [gRes, balRes, expRes, debtRes] = await Promise.all([
          groupService.getById(id),
          groupService.getBalances(id),
          expenseService.getAll({ groupId: id }),
          settlementService.getSimplified({ groupId: id }),
        ])
        setGroup(gRes.data.data)
        setBalances(balRes.data.data)
        setExpenses(expRes.data.data)
        setDebts(debtRes.data.data)
      } catch {
        toast.error('Failed to load group')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const handleSettle = async () => {
    try {
      await groupService.settle(id)
      toast.success('Group marked as settled!')
      setGroup(p => ({ ...p, status: 'settled' }))
    } catch {
      toast.error('Failed to settle group')
    }
  }

  const handleRemoveMember = async (userId) => {
    try {
      await groupService.removeMember(id, userId)
      setGroup(p => ({
        ...p,
        members: p.members.filter(m => m.user._id !== userId)
      }))
      toast.success('Member removed')
    } catch {
      toast.error('Failed to remove member')
    }
  }

  if (loading) return <Skeleton className="h-96" />
  if (!group) return <EmptyState icon="❌" title="Group not found" />

  const isOwner = group.owner?._id === user._id || group.owner === user._id
  const myBalance = balances?.balances?.[user._id] || balances?.balances?.[user._id?.toString()]

  return (
    <div className="space-y-6">
      <div className="card">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="text-5xl">{group.emoji}</div>
          <div className="flex-1">
            <h1 className="font-display font-bold text-2xl text-gray-800">{group.name}</h1>
            {group.description && <p className="text-gray-500 text-sm mt-1">{group.description}</p>}
            <div className="flex items-center gap-2 mt-3">
              {group.members?.slice(0, 6).map((m, i) => (
                <Avatar key={i} src={m.user?.avatar} name={m.user?.name} size="sm"
                        className="-ml-1 first:ml-0 ring-2 ring-white" />
              ))}
              {group.members?.length > 6 && (
                <span className="text-xs text-gray-500">+{group.members.length - 6}</span>
              )}
              <Badge variant={group.status === 'active' ? 'success' : 'primary'}>{group.status}</Badge>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => navigate('/add-expense')}>Add Expense</Button>
            {isOwner && <Button variant="outline" onClick={handleSettle}>Settle Group</Button>}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-xs text-gray-500">Total Spent</p>
          <p className="font-display font-bold text-xl">{formatAmount(group.totalExpenses)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Your Share</p>
          <p className="font-display font-bold text-xl">{formatAmount(myBalance?.owes || 0)}</p>
        </div>
        <div className="card text-center">
          <p className="text-xs text-gray-500">Members</p>
          <p className="font-display font-bold text-xl">{group.members?.length}</p>
        </div>
      </div>

      <Tabs tabs={[
        { id: 'expenses', label: 'Expenses' },
        { id: 'members', label: 'Members' },
        { id: 'balances', label: 'Balances' },
      ]} active={tab} onChange={setTab} />

      {tab === 'expenses' && (
        <div className="space-y-3">
          {expenses.length === 0 ? (
            <EmptyState icon="📋" title="No expenses yet"
                        action={{ label: 'Add First Expense', onClick: () => navigate('/add-expense') }} />
          ) : expenses.map(exp => (
            <ExpenseCard key={exp._id} expense={exp} currentUserId={user._id} />
          ))}
        </div>
      )}

      {tab === 'members' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {group.members?.map((m, i) => {
            const bal = balances?.balances?.[m.user?._id] || balances?.balances?.[m.user?._id?.toString()]
            return (
              <div key={i} className="card flex items-center gap-3">
                <Avatar src={m.user?.avatar} name={m.user?.name} size="md" />
                <div className="flex-1">
                  <p className="font-medium text-sm">{m.user?.name}</p>
                  <Badge variant={m.role === 'owner' ? 'primary' : 'neutral'}>{m.role}</Badge>
                  {bal && (
                    <p className="text-xs text-gray-500 mt-1">
                      Paid: {formatAmount(bal.paid)} | Owes: {formatAmount(bal.owes)}
                    </p>
                  )}
                </div>
                {isOwner && m.user?._id !== user._id && m.role !== 'owner' && (
                  <Button size="sm" variant="danger" onClick={() => handleRemoveMember(m.user._id)}>Remove</Button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {tab === 'balances' && (
        <div className="space-y-3">
          {debts.length === 0 ? (
            <EmptyState icon="🎉" title="All settled up!" description="No outstanding balances in this group" />
          ) : debts.map((d, i) => (
            <SettlementRow key={i} debt={d} />
          ))}
        </div>
      )}
    </div>
  )
}
