import { useApp } from '../../context/AppContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'
import { formatRelative } from '../../utils/dateHelpers.js'

const CATEGORY_ICONS = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Entertainment: '🎬',
  Housing: '🏠', Health: '💊', Others: '📦'
}

export default function ExpenseCard({ expense, currentUserId, expanded, onToggle }) {
  const { formatAmount } = useApp()
  const mySplit = expense.splits?.find(s => s.user?._id === currentUserId || s.user === currentUserId)

  return (
    <div className="card-hover" onClick={onToggle}>
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-xl flex-shrink-0">
          {CATEGORY_ICONS[expense.category] || '📦'}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-800">{expense.title}</p>
          <div className="flex items-center gap-2 mt-1">
            {expense.group && <Badge variant="primary">{expense.group.emoji} {expense.group.name}</Badge>}
            <div className="flex items-center gap-1 text-xs text-gray-500">
              <Avatar src={expense.paidBy?.avatar} name={expense.paidBy?.name} size="sm" className="w-4 h-4" />
              Paid by {expense.paidBy?.name}
            </div>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-primary">{formatAmount(expense.amount)}</p>
          {mySplit && <p className="text-xs text-gray-500">Your share: {formatAmount(mySplit.amount)}</p>}
          <p className="text-xs text-gray-400 mt-1">{formatRelative(expense.date)}</p>
        </div>
      </div>

      {expanded && (
        <div className="mt-4 border-t border-gray-100 pt-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gray-500 text-xs">
                <th className="text-left pb-2">Person</th>
                <th className="text-right pb-2">Share</th>
                <th className="text-right pb-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {expense.splits?.map((s, i) => (
                <tr key={i} className="border-t border-gray-50">
                  <td className="py-2 flex items-center gap-2">
                    <Avatar src={s.user?.avatar} name={s.user?.name} size="sm" />
                    {s.user?.name}
                  </td>
                  <td className="text-right py-2">{formatAmount(s.amount)}</td>
                  <td className="text-right py-2">
                    <Badge variant={s.isPaid ? 'success' : 'danger'}>
                      {s.isPaid ? 'Paid' : 'Pending'}
                    </Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
