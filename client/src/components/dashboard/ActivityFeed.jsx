import { useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import { formatRelative } from '../../utils/dateHelpers.js'

const CATEGORY_ICONS = {
  Food: '🍕', Travel: '✈️', Shopping: '🛍️', Entertainment: '🎬',
  Housing: '🏠', Health: '💊', Others: '📦'
}

export default function ActivityFeed({ expenses = [] }) {
  const navigate = useNavigate()
  const { formatAmount } = useApp()

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-gray-800 mb-4">Recent Expenses</h3>
      <div className="space-y-3">
        {expenses.map(exp => (
          <div key={exp._id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-wbg transition-colors">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-lg">
              {CATEGORY_ICONS[exp.category] || '📦'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-800 truncate">{exp.title}</p>
              <div className="flex items-center gap-2 text-xs text-gray-500">
                {exp.group && <span>{exp.group.emoji} {exp.group.name}</span>}
                <Avatar src={exp.paidBy?.avatar} name={exp.paidBy?.name} size="sm" className="w-4 h-4" />
                <span>{exp.paidBy?.name}</span>
              </div>
            </div>
            <div className="text-right">
              <p className="font-semibold text-primary text-sm">{formatAmount(exp.amount)}</p>
              <p className="text-xs text-gray-400">{formatRelative(exp.date)}</p>
            </div>
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/expenses')}
              className="mt-4 text-sm text-primary font-semibold hover:underline">
        View All Expenses →
      </button>
    </div>
  )
}
