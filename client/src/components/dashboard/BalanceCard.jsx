import { useApp } from '../../context/AppContext.jsx'

export default function BalanceCard({ emoji, label, amount, subtext, bg = 'bg-red-50' }) {
  const { formatAmount } = useApp()
  return (
    <div className={`card ${bg}`}>
      <p className="text-sm text-gray-600 mb-1">{emoji} {label}</p>
      <p className="font-display font-bold text-2xl text-gray-800">{formatAmount(amount)}</p>
      {subtext && <p className="text-xs text-gray-500 mt-1">{subtext}</p>}
    </div>
  )
}
