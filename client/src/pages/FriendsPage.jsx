import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { friendService } from '../services/friendService.js'
import { expenseService } from '../services/expenseService.js'
import FriendCard from '../components/friends/FriendCard.jsx'
import ExpenseCard from '../components/expenses/ExpenseCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Avatar from '../components/ui/Avatar.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useApp } from '../context/AppContext.jsx'
import toast from 'react-hot-toast'

export default function FriendsPage() {
  const { user } = useAuth()
  const { formatAmount } = useApp()
  const navigate = useNavigate()
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [balance, setBalance] = useState(null)
  const [sharedExpenses, setSharedExpenses] = useState([])
  const [showAddModal, setShowAddModal] = useState(false)
  const [showRemove, setShowRemove] = useState(false)
  const [addEmail, setAddEmail] = useState('')
  const [balances, setBalances] = useState({})

  useEffect(() => {
    friendService.getAll()
      .then(r => {
        setFriends(r.data.data)
        r.data.data.forEach(f => {
          friendService.getBalance(f._id).then(b => {
            setBalances(prev => ({ ...prev, [f._id]: b.data.data }))
          }).catch(() => {})
        })
      })
      .finally(() => setLoading(false))
  }, [])

  const selectFriend = async (friend) => {
    setSelected(friend)
    try {
      const [balRes, expRes] = await Promise.all([
        friendService.getBalance(friend._id),
        expenseService.getAll({ friendId: friend._id, limit: 10 }),
      ])
      setBalance(balRes.data.data)
      setSharedExpenses(expRes.data.data)
    } catch {
      toast.error('Failed to load friend details')
    }
  }

  const handleAddFriend = async () => {
    try {
      await friendService.sendRequest({ email: addEmail })
      toast.success('Friend request sent!')
      setShowAddModal(false)
      setAddEmail('')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send request')
    }
  }

  const handleRemove = async () => {
    try {
      await friendService.remove(selected._id)
      setFriends(prev => prev.filter(f => f._id !== selected._id))
      setSelected(null)
      toast.success('Friend removed')
    } catch {
      toast.error('Failed to remove friend')
    }
  }

  const filtered = friends.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase()) ||
    f.email.toLowerCase().includes(search.toLowerCase())
  )

  if (loading) return <Skeleton className="h-96" />

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <input placeholder="Search friends..." className="input-field"
               value={search} onChange={e => setSearch(e.target.value)} />
        <Button onClick={() => setShowAddModal(true)} fullWidth>Add Friend</Button>
        <div className="space-y-2">
          {filtered.map(f => (
            <FriendCard key={f._id} friend={f} balance={balances[f._id]}
                        selected={selected?._id === f._id} onClick={() => selectFriend(f)} />
          ))}
        </div>
      </div>

      <div className="lg:col-span-3">
        {!selected ? (
          <EmptyState icon="👥" title="Select a friend" description="Choose a friend to view details and shared expenses" />
        ) : (
          <div className="space-y-6">
            <div className="card text-center">
              <Avatar src={selected.avatar} name={selected.name} size="xl" className="mx-auto mb-4" />
              <h2 className="font-display font-bold text-xl">{selected.name}</h2>
              <p className="text-gray-500 text-sm">{selected.email}</p>
              {selected.phone && <p className="text-gray-400 text-sm">{selected.phone}</p>}
              {balance && (
                <div className="grid grid-cols-3 gap-4 mt-6 border-t border-gray-100 pt-4">
                  <div>
                    <p className="text-xs text-gray-500">You Owe</p>
                    <p className="font-semibold text-red-600">{formatAmount(balance.youOwe)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">They Owe</p>
                    <p className="font-semibold text-green-600">{formatAmount(balance.theyOwe)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Net</p>
                    <p className="font-semibold">{formatAmount(balance.netBalance)}</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 mt-4 justify-center">
                <Button onClick={() => navigate('/settlements')}>Settle Up</Button>
                <Button variant="danger" onClick={() => setShowRemove(true)}>Remove Friend</Button>
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="font-display font-semibold text-gray-800">Shared Expenses</h3>
              {sharedExpenses.map(exp => (
                <ExpenseCard key={exp._id} expense={exp} currentUserId={user._id} />
              ))}
            </div>
          </div>
        )}
      </div>

      <Modal isOpen={showAddModal} onClose={() => setShowAddModal(false)} title="Add Friend">
        <Input label="Email" type="email" value={addEmail} onChange={e => setAddEmail(e.target.value)}
               placeholder="friend@email.com" className="mb-4" />
        <Button fullWidth onClick={handleAddFriend}>Send Request</Button>
      </Modal>

      <ConfirmDialog isOpen={showRemove} onClose={() => setShowRemove(false)}
                     onConfirm={handleRemove} title="Remove Friend"
                     message={`Remove ${selected?.name} from your friends?`}
                     confirmText="Remove" variant="danger" />
    </div>
  )
}
