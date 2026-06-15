import { useEffect, useState, useCallback } from 'react'
import { expenseService } from '../services/expenseService.js'
import { groupService } from '../services/groupService.js'
import { useAuth } from '../context/AuthContext.jsx'
import ExpenseCard from '../components/expenses/ExpenseCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'

export default function ExpenseHistoryPage() {
  const { user } = useAuth()
  const [expenses, setExpenses] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(false)
  const [expanded, setExpanded] = useState(null)
  const [filters, setFilters] = useState({ search: '', category: '', groupId: '', startDate: '', endDate: '' })
  const [searchInput, setSearchInput] = useState('')

  useEffect(() => {
    groupService.getAll().then(r => setGroups(r.data.data)).catch(() => {})
  }, [])

  const loadExpenses = useCallback(async (pageNum = 1, append = false) => {
    setLoading(true)
    try {
      const res = await expenseService.getAll({ ...filters, page: pageNum, limit: 10 })
      const data = res.data.data
      setExpenses(prev => append ? [...prev, ...data] : data)
      setHasMore(res.data.pagination?.page < res.data.pagination?.pages)
      setPage(pageNum)
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }, [filters])

  useEffect(() => {
    const timer = setTimeout(() => setFilters(p => ({ ...p, search: searchInput })), 400)
    return () => clearTimeout(timer)
  }, [searchInput])

  useEffect(() => { loadExpenses(1, false) }, [loadExpenses])

  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 bg-wbg/80 backdrop-blur rounded-2xl p-4 flex flex-wrap gap-3">
        <input placeholder="Search expenses..." className="input-field flex-1 min-w-[200px]"
               value={searchInput} onChange={e => setSearchInput(e.target.value)} />
        <input type="date" className="input-field w-auto" value={filters.startDate}
               onChange={e => setFilters(p => ({ ...p, startDate: e.target.value }))} />
        <input type="date" className="input-field w-auto" value={filters.endDate}
               onChange={e => setFilters(p => ({ ...p, endDate: e.target.value }))} />
        <select className="input-field w-auto" value={filters.category}
                onChange={e => setFilters(p => ({ ...p, category: e.target.value }))}>
          <option value="">All Categories</option>
          {['Food','Travel','Shopping','Entertainment','Housing','Health','Others'].map(c =>
            <option key={c} value={c}>{c}</option>
          )}
        </select>
        <select className="input-field w-auto" value={filters.groupId}
                onChange={e => setFilters(p => ({ ...p, groupId: e.target.value }))}>
          <option value="">All Groups</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.name}</option>)}
        </select>
      </div>

      {loading && expenses.length === 0 ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-24" />)}</div>
      ) : expenses.length === 0 ? (
        <EmptyState icon="📋" title="No expenses found" description="Try adjusting your filters or add a new expense" />
      ) : (
        <div className="space-y-3">
          {expenses.map(exp => (
            <ExpenseCard key={exp._id} expense={exp} currentUserId={user._id}
                         expanded={expanded === exp._id}
                         onToggle={() => setExpanded(expanded === exp._id ? null : exp._id)} />
          ))}
          {hasMore && (
            <Button variant="outline" fullWidth loading={loading}
                    onClick={() => loadExpenses(page + 1, true)}>
              Load More
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
