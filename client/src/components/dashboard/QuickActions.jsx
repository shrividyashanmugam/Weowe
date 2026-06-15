import { useNavigate } from 'react-router-dom'
import Button from '../ui/Button.jsx'

export default function QuickActions() {
  const navigate = useNavigate()
  const actions = [
    { label: 'Add Expense', path: '/add-expense', variant: 'primary' },
    { label: 'Create Group', path: '/groups', variant: 'outline' },
    { label: 'Settle Up', path: '/settlements', variant: 'outline' },
  ]

  return (
    <div className="card">
      <h3 className="font-display font-semibold text-gray-800 mb-4">Quick Actions</h3>
      <div className="flex flex-col gap-3">
        {actions.map(a => (
          <Button key={a.path} variant={a.variant} fullWidth onClick={() => navigate(a.path)}>
            {a.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
