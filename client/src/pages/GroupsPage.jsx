import { useEffect, useState } from 'react'
import { groupService } from '../services/groupService.js'
import { friendService } from '../services/friendService.js'
import GroupCard from '../components/groups/GroupCard.jsx'
import EmptyState from '../components/ui/EmptyState.jsx'
import Modal from '../components/ui/Modal.jsx'
import Input from '../components/ui/Input.jsx'
import Button from '../components/ui/Button.jsx'
import ConfirmDialog from '../components/ui/ConfirmDialog.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

const EMOJIS = ['✈️','💼','🎓','🏖️','🎬','🍕','🏠','🎮','💪','🎉','🏕️','🚗','🛒','🎸','⚽','🎂','🌏','💊','🐶','🎯']

export default function GroupsPage() {
  const [groups, setGroups] = useState([])
  const [friends, setFriends] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showDelete, setShowDelete] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [form, setForm] = useState({ name: '', emoji: '👥', description: '', memberIds: [] })

  useEffect(() => {
    Promise.all([groupService.getAll(), friendService.getAll()])
      .then(([gRes, fRes]) => {
        setGroups(gRes.data.data)
        setFriends(fRes.data.data)
      })
      .finally(() => setLoading(false))
  }, [])

  const handleCreate = async () => {
    if (!form.name.trim()) return toast.error('Group name required')
    try {
      const res = await groupService.create(form)
      setGroups(prev => [res.data.data, ...prev])
      setShowCreate(false)
      setForm({ name: '', emoji: '👥', description: '', memberIds: [] })
      toast.success('Group created!')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create group')
    }
  }

  const handleDelete = async () => {
    try {
      await groupService.delete(deleteTarget._id)
      setGroups(prev => prev.filter(g => g._id !== deleteTarget._id))
      setShowDelete(false)
      toast.success('Group deleted')
    } catch {
      toast.error('Failed to delete group')
    }
  }

  const toggleMember = (id) => {
    setForm(prev => ({
      ...prev,
      memberIds: prev.memberIds.includes(id)
        ? prev.memberIds.filter(m => m !== id)
        : [...prev.memberIds, id]
    }))
  }

  if (loading) return <Skeleton className="h-96" />

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-display font-bold text-xl text-gray-800">My Groups</h2>
        <Button onClick={() => setShowCreate(true)}>Create Group</Button>
      </div>

      {groups.length === 0 ? (
        <EmptyState icon="👥" title="No groups yet" description="Create your first group to start splitting expenses"
                    action={{ label: 'Create Group', onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {groups.map(g => (
            <GroupCard key={g._id} group={g}
                       onDelete={(group) => { setDeleteTarget(group); setShowDelete(true) }} />
          ))}
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Create Group" size="lg">
        <div className="space-y-4">
          <Input label="Group Name" value={form.name}
                 onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Emoji</label>
            <div className="flex flex-wrap gap-2">
              {EMOJIS.map(e => (
                <button key={e} onClick={() => setForm(p => ({ ...p, emoji: e }))}
                        className={`w-10 h-10 rounded-xl text-xl ${form.emoji === e ? 'bg-primary/20 ring-2 ring-primary' : 'bg-wbg'}`}>
                  {e}
                </button>
              ))}
            </div>
          </div>
          <Input label="Description (optional)" value={form.description}
                 onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
          {friends.length > 0 && (
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Add Members</label>
              <div className="flex flex-wrap gap-2">
                {friends.map(f => (
                  <button key={f._id} onClick={() => toggleMember(f._id)}
                          className={`px-3 py-1.5 rounded-xl text-sm ${form.memberIds.includes(f._id) ? 'bg-primary text-white' : 'bg-wbg text-gray-700'}`}>
                    {f.name}
                  </button>
                ))}
              </div>
            </div>
          )}
          <Button fullWidth onClick={handleCreate}>Create Group</Button>
        </div>
      </Modal>

      <ConfirmDialog isOpen={showDelete} onClose={() => setShowDelete(false)}
                     onConfirm={handleDelete} title="Delete Group"
                     message={`Delete "${deleteTarget?.name}"? This cannot be undone.`}
                     confirmText="Delete" variant="danger" />
    </div>
  )
}
