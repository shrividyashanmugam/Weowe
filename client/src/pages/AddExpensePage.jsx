import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { friendService } from '../services/friendService.js'
import { groupService } from '../services/groupService.js'
import { expenseService } from '../services/expenseService.js'
import { calculateEqualSplits } from '../utils/calculateSplits.js'
import Button from '../components/ui/Button.jsx'
import Input from '../components/ui/Input.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import toast from 'react-hot-toast'

const CATEGORIES = [
  { id: 'Food', emoji: '🍕' }, { id: 'Travel', emoji: '✈️' },
  { id: 'Shopping', emoji: '🛍️' }, { id: 'Entertainment', emoji: '🎬' },
  { id: 'Housing', emoji: '🏠' }, { id: 'Health', emoji: '💊' },
  { id: 'Others', emoji: '📦' },
]

export default function AddExpensePage() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [groups, setGroups] = useState([])
  const [loading, setLoading] = useState(false)
  const [splitMethod, setSplitMethod] = useState('equal')
  const [form, setForm] = useState({
    title: '', amount: '', category: 'Food', date: new Date().toISOString().split('T')[0],
    description: '', groupId: '', paidById: user?._id,
  })
  const [selectedPeople, setSelectedPeople] = useState([user?._id])
  const [percentSplits, setPercentSplits] = useState({})
  const [exactSplits, setExactSplits] = useState({})

  useEffect(() => {
    Promise.all([friendService.getAll(), groupService.getAll()])
      .then(([fRes, gRes]) => {
        setFriends(fRes.data.data)
        setGroups(gRes.data.data)
      })
  }, [])

  useEffect(() => {
    if (user?._id) {
      setForm(p => ({ ...p, paidById: user._id }))
      setSelectedPeople([user._id])
    }
  }, [user])

  const allPeople = [
    { _id: user?._id, name: user?.name, avatar: user?.avatar },
    ...friends,
  ]

  const amount = parseFloat(form.amount) || 0

  const getSplits = () => {
    if (splitMethod === 'equal') {
      return calculateEqualSplits(amount, selectedPeople)
    }
    if (splitMethod === 'percentage') {
      return selectedPeople.map(uid => ({
        userId: uid,
        amount: Math.round((amount * (percentSplits[uid] || 0) / 100) * 100) / 100,
        percent: percentSplits[uid] || 0,
      }))
    }
    return selectedPeople.map(uid => ({
      userId: uid,
      amount: parseFloat(exactSplits[uid]) || 0,
    }))
  }

  const totalPercent = selectedPeople.reduce((s, uid) => s + (percentSplits[uid] || 0), 0)
  const totalExact = selectedPeople.reduce((s, uid) => s + (parseFloat(exactSplits[uid]) || 0), 0)
  const canSubmit = form.title && amount > 0 && selectedPeople.length > 0 &&
    (splitMethod === 'equal' || (splitMethod === 'percentage' && totalPercent === 100) ||
     (splitMethod === 'exact' && Math.abs(totalExact - amount) < 0.01))

  const handleSubmit = async () => {
    if (!canSubmit) return
    setLoading(true)
    try {
      await expenseService.create({
        title: form.title,
        amount,
        category: form.category,
        date: form.date,
        description: form.description,
        groupId: form.groupId || undefined,
        paidById: form.paidById,
        splitMethod,
        splits: getSplits(),
      })
      toast.success('Expense added!')
      navigate('/expenses')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to add expense')
    } finally {
      setLoading(false)
    }
  }

  const togglePerson = (id) => {
    setSelectedPeople(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-gray-800">Basic Info</h3>
        <Input label="Expense Title" value={form.title}
               onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
        <div>
          <label className="text-sm font-medium text-gray-700 mb-1.5 block">Amount</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-bold">₹</span>
            <input type="number" className="input-field pl-10 text-2xl font-display font-bold"
                   value={form.amount} onChange={e => setForm(p => ({ ...p, amount: e.target.value }))} />
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 mb-2 block">Category</label>
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
            {CATEGORIES.map(c => (
              <button key={c.id} onClick={() => setForm(p => ({ ...p, category: c.id }))}
                      className={`p-3 rounded-2xl text-center transition-all
                        ${form.category === c.id ? 'bg-primary/10 ring-2 ring-primary' : 'bg-wbg hover:bg-primary/5'}`}>
                <span className="text-2xl">{c.emoji}</span>
                <p className="text-xs mt-1 text-gray-600">{c.id}</p>
              </button>
            ))}
          </div>
        </div>
        <Input label="Date" type="date" value={form.date}
               onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
        <Input label="Description (optional)" value={form.description}
               onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
      </div>

      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-gray-800">Paid By</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {allPeople.filter(p => p._id).map(p => (
            <button key={p._id} onClick={() => setForm(f => ({ ...f, paidById: p._id }))}
                    className={`flex items-center gap-2 p-3 rounded-2xl border-2 transition-all
                      ${form.paidById === p._id ? 'border-primary bg-wbg' : 'border-gray-100'}`}>
              <Avatar src={p.avatar} name={p.name} size="sm" />
              <span className="text-sm font-medium truncate">{p.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="card space-y-4">
        <h3 className="font-display font-semibold text-gray-800">Split Method</h3>
        <div className="flex gap-2">
          {['equal', 'percentage', 'exact'].map(m => (
            <button key={m} onClick={() => setSplitMethod(m)}
                    className={`px-4 py-2 rounded-xl text-sm font-medium capitalize
                      ${splitMethod === m ? 'bg-primary text-white' : 'bg-wbg text-gray-600'}`}>
              {m === 'equal' ? 'Equal Split' : m === 'percentage' ? 'Percentage %' : 'Exact Amount'}
            </button>
          ))}
        </div>

        <div className="space-y-2">
          {allPeople.filter(p => p._id).map(p => (
            <div key={p._id} className="flex items-center gap-3 p-2 rounded-xl hover:bg-wbg">
              {splitMethod === 'equal' && (
                <input type="checkbox" checked={selectedPeople.includes(p._id)}
                       onChange={() => togglePerson(p._id)} className="accent-primary" />
              )}
              <Avatar src={p.avatar} name={p.name} size="sm" />
              <span className="flex-1 text-sm font-medium">{p.name}</span>
              {splitMethod === 'equal' && selectedPeople.includes(p._id) && (
                <span className="text-sm text-primary font-semibold">
                  ₹{((amount / selectedPeople.length) || 0).toFixed(2)}
                </span>
              )}
              {splitMethod === 'percentage' && (
                <input type="number" placeholder="%" className="input-field w-20 text-center"
                       value={percentSplits[p._id] || ''}
                       onChange={e => {
                         if (!selectedPeople.includes(p._id)) togglePerson(p._id)
                         setPercentSplits(prev => ({ ...prev, [p._id]: parseFloat(e.target.value) || 0 }))
                       }} />
              )}
              {splitMethod === 'exact' && (
                <input type="number" placeholder="₹" className="input-field w-24 text-center"
                       value={exactSplits[p._id] || ''}
                       onChange={e => {
                         if (!selectedPeople.includes(p._id)) togglePerson(p._id)
                         setExactSplits(prev => ({ ...prev, [p._id]: e.target.value }))
                       }} />
              )}
            </div>
          ))}
        </div>

        {splitMethod === 'percentage' && (
          <p className={`text-sm ${totalPercent === 100 ? 'text-green-600' : 'text-red-600'}`}>
            Total: {totalPercent}% {totalPercent !== 100 ? `— need ${100 - totalPercent}% more` : '✓'}
          </p>
        )}
        {splitMethod === 'exact' && (
          <p className={`text-sm ${Math.abs(totalExact - amount) < 0.01 ? 'text-green-600' : 'text-red-600'}`}>
            ₹{(amount - totalExact).toFixed(2)} remaining to assign
          </p>
        )}
      </div>

      <div className="card">
        <label className="text-sm font-medium text-gray-700 mb-2 block">Group (optional)</label>
        <select className="input-field" value={form.groupId}
                onChange={e => setForm(p => ({ ...p, groupId: e.target.value }))}>
          <option value="">No Group (Personal)</option>
          {groups.map(g => <option key={g._id} value={g._id}>{g.emoji} {g.name}</option>)}
        </select>
      </div>

      <div className="flex gap-3">
        <Button fullWidth loading={loading} disabled={!canSubmit} onClick={handleSubmit}>
          Save Expense
        </Button>
        <Button variant="outline" onClick={() => navigate(-1)}>Cancel</Button>
      </div>
    </div>
  )
}
