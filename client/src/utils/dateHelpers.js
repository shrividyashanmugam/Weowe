import { formatDistanceToNow, format } from 'date-fns'

export const formatRelative = (date) => formatDistanceToNow(new Date(date), { addSuffix: true })

export const formatDate = (date) => format(new Date(date), 'dd MMM yyyy')

export const groupByDate = (items) => {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1)
  const weekAgo = new Date(today); weekAgo.setDate(weekAgo.getDate() - 7)

  const groups = { Today: [], Yesterday: [], 'This Week': [], Older: [] }
  items.forEach(item => {
    const d = new Date(item.createdAt || item.date)
    if (d >= today) groups.Today.push(item)
    else if (d >= yesterday) groups.Yesterday.push(item)
    else if (d >= weekAgo) groups['This Week'].push(item)
    else groups.Older.push(item)
  })
  return groups
}
