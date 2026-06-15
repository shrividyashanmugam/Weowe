import { useApp } from '../../context/AppContext.jsx'

export default function StatCard({ label, value, icon: Icon, color = 'primary' }) {
  const colors = {
    primary: 'bg-primary/10 text-primary',
    green:   'bg-green-50 text-green-600',
    red:     'bg-red-50 text-red-600',
    amber:   'bg-amber-50 text-amber-600',
  }

  return (
    <div className="stat-card">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        {Icon && <Icon size={22} />}
      </div>
      <div>
        <p className="text-gray-500 text-xs font-medium">{label}</p>
        <p className="font-display font-bold text-xl text-gray-800">{value}</p>
      </div>
    </div>
  )
}
