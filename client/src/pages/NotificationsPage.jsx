import { useEffect, useState } from 'react'
import {
  FiShoppingBag, FiDollarSign, FiUserPlus, FiUsers,
  FiCheckCircle, FiAlertCircle, FiCheck, FiTrash2
} from 'react-icons/fi'
import { notificationService } from '../services/notificationService.js'
import { groupByDate, formatRelative } from '../utils/dateHelpers.js'
import Badge from '../components/ui/Badge.jsx'
import Button from '../components/ui/Button.jsx'
import Skeleton from '../components/ui/Skeleton.jsx'
import toast from 'react-hot-toast'

const TYPE_CONFIG = {
  expense_added:    { icon: FiShoppingBag,  bg: 'bg-blue-50',   color: 'text-blue-600' },
  payment_received: { icon: FiDollarSign,   bg: 'bg-green-50',  color: 'text-green-600' },
  friend_request:   { icon: FiUserPlus,     bg: 'bg-purple-50', color: 'text-purple-600' },
  group_invite:     { icon: FiUsers,        bg: 'bg-yellow-50', color: 'text-yellow-600' },
  settlement:       { icon: FiCheckCircle,  bg: 'bg-primary/10', color: 'text-primary' },
  reminder:         { icon: FiAlertCircle,  bg: 'bg-red-50',    color: 'text-red-600' },
}

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationService.getAll()
      .then(r => setNotifications(r.data.data))
      .finally(() => setLoading(false))
  }, [])

  const unread = notifications.filter(n => !n.isRead).length

  const handleMarkRead = async (id) => {
    await notificationService.markAsRead(id)
    setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
  }

  const handleMarkAllRead = async () => {
    await notificationService.markAllRead()
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
    toast.success('All marked as read')
  }

  const handleDelete = async (id) => {
    await notificationService.delete(id)
    setNotifications(prev => prev.filter(n => n._id !== id))
  }

  const handleClearAll = async () => {
    await notificationService.clearAll()
    setNotifications([])
    toast.success('All notifications cleared')
  }

  if (loading) return <Skeleton className="h-96" />

  const grouped = groupByDate(notifications)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="font-display font-semibold text-lg text-gray-800">Notifications</h2>
          {unread > 0 && <Badge variant="primary">{unread} unread</Badge>}
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="outline" onClick={handleMarkAllRead}>Mark All Read</Button>
          <Button size="sm" variant="danger" onClick={handleClearAll}>Clear All</Button>
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-gray-500">No notifications yet</div>
      ) : (
        Object.entries(grouped).map(([label, items]) => {
          if (!items.length) return null
          return (
            <div key={label}>
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">{label}</h3>
              <div className="space-y-2">
                {items.map(n => {
                  const cfg = TYPE_CONFIG[n.type] || TYPE_CONFIG.reminder
                  const Icon = cfg.icon
                  return (
                    <div key={n._id}
                         onClick={() => !n.isRead && handleMarkRead(n._id)}
                         className={`flex items-start gap-4 p-4 rounded-2xl transition-all cursor-pointer group
                           ${n.isRead ? 'bg-white shadow-card' : 'bg-primary/5 border-l-4 border-primary'}`}>
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                        <Icon size={18} className={cfg.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-800">{n.message}</p>
                        <p className="text-xs text-gray-400 mt-1">{formatRelative(n.createdAt)}</p>
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button onClick={(e) => { e.stopPropagation(); handleMarkRead(n._id) }}
                                  className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-wbg">
                            <FiCheck size={16} />
                          </button>
                        )}
                        <button onClick={(e) => { e.stopPropagation(); handleDelete(n._id) }}
                                className="p-2 text-gray-400 hover:text-danger rounded-lg hover:bg-red-50">
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
