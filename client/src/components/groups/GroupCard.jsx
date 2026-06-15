import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'

export default function GroupCard({ group, onEdit, onDelete }) {
  const navigate = useNavigate()
  const { formatAmount } = useApp()
  const members = group.members || []
  const statusVariant = group.status === 'active' ? 'success' : group.status === 'settled' ? 'primary' : 'neutral'

  return (
    <div className="card-hover" onClick={() => navigate(`/groups/${group._id}`)}>
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-wbg flex items-center justify-center text-2xl">
            {group.emoji}
          </div>
          <div>
            <h3 className="font-display font-semibold text-gray-800">{group.name}</h3>
            <Badge variant={statusVariant}>{group.status}</Badge>
          </div>
        </div>
        <div className="flex gap-1" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit?.(group)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-wbg text-xs">Edit</button>
          <button onClick={() => onDelete?.(group)} className="p-2 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50 text-xs">Delete</button>
        </div>
      </div>

      <div className="flex items-center gap-1 mb-4">
        {members.slice(0, 4).map((m, i) => (
          <Avatar key={i} src={m.user?.avatar} name={m.user?.name} size="sm"
                  className="-ml-1 first:ml-0 ring-2 ring-white" />
        ))}
        {members.length > 4 && (
          <span className="text-xs text-gray-500 ml-2">+{members.length - 4} more</span>
        )}
      </div>

      <div className="grid grid-cols-3 gap-2 text-center border-t border-gray-100 pt-4">
        <div>
          <p className="text-xs text-gray-500">Total</p>
          <p className="font-semibold text-sm">{formatAmount(group.totalExpenses)}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Members</p>
          <p className="font-semibold text-sm">{members.length}</p>
        </div>
        <div>
          <p className="text-xs text-gray-500">Status</p>
          <p className="font-semibold text-sm capitalize">{group.status}</p>
        </div>
      </div>
    </div>
  )
}
