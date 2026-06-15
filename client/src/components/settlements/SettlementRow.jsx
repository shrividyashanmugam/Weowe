import { FiArrowRight } from 'react-icons/fi'
import { useApp } from '../../context/AppContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Button from '../ui/Button.jsx'

export default function SettlementRow({ debt, onMarkPaid, onReminder }) {
  const { formatAmount } = useApp()
  const from = debt.from
  const to = debt.to

  return (
    <div className="card flex flex-col sm:flex-row items-center gap-4">
      <div className="flex items-center gap-4 flex-1">
        <div className="text-center">
          <Avatar src={from?.avatar} name={from?.name} size="lg" />
          <p className="text-xs font-medium mt-1 text-gray-700">{from?.name}</p>
        </div>
        <FiArrowRight className="text-gray-400" size={20} />
        <div className="text-center">
          <Avatar src={to?.avatar} name={to?.name} size="lg" />
          <p className="text-xs font-medium mt-1 text-gray-700">{to?.name}</p>
        </div>
        <span className="bg-red-50 text-red-600 font-bold px-4 py-2 rounded-xl text-sm">
          {formatAmount(debt.amount)}
        </span>
      </div>
      <div className="flex gap-2">
        {onMarkPaid && (
          <Button size="sm" variant="primary" onClick={() => onMarkPaid(debt)}>Mark as Paid</Button>
        )}
        {onReminder && (
          <Button size="sm" variant="outline" onClick={() => onReminder(debt)}>Send Reminder</Button>
        )}
      </div>
    </div>
  )
}
