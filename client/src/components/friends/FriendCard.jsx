import { useApp } from '../../context/AppContext.jsx'
import Avatar from '../ui/Avatar.jsx'
import Badge from '../ui/Badge.jsx'

export default function FriendCard({ friend, balance, selected, onClick }) {
  const { formatAmount } = useApp()

  let balanceText = 'Settled'
  let balanceVariant = 'neutral'
  if (balance) {
    if (balance.netBalance > 0) {
      balanceText = `${formatAmount(balance.netBalance)} owes you`
      balanceVariant = 'success'
    } else if (balance.netBalance < 0) {
      balanceText = `You owe ${formatAmount(balance.netBalance)}`
      balanceVariant = 'danger'
    }
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all
        ${selected ? 'bg-primary/10 border-2 border-primary' : 'hover:bg-wbg border-2 border-transparent'}`}
    >
      <Avatar src={friend.avatar} name={friend.name} size="md" />
      <div className="flex-1 min-w-0">
        <p className="font-medium text-sm text-gray-800 truncate">{friend.name}</p>
        <p className="text-xs text-gray-500 truncate">{friend.email}</p>
      </div>
      <Badge variant={balanceVariant}>{balanceText}</Badge>
    </div>
  )
}
