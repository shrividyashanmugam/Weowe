import Expense from '../models/Expense.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse } from '../utils/apiResponse.js'

const getPeriodStart = (period) => {
  const now = new Date()
  if (period === 'month')   return new Date(now.getFullYear(), now.getMonth(), 1)
  if (period === '3months') return new Date(now.getFullYear(), now.getMonth() - 3, 1)
  if (period === '6months') return new Date(now.getFullYear(), now.getMonth() - 6, 1)
  return new Date(now.getFullYear(), 0, 1)
}

export const getByCategory = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const startDate = getPeriodStart(req.query.period || 'month')

  const result = await Expense.aggregate([
    { $match: {
        $or: [{ paidBy: userId }, { 'splits.user': userId }],
        date: { $gte: startDate }
    }},
    { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } }
  ])

  const colors = {
    Food:'#1A6B6B', Travel:'#2E8B8B', Shopping:'#00CEC9',
    Entertainment:'#6C5CE7', Housing:'#FDCB6E', Health:'#2ED573', Others:'#636E72'
  }

  const data = result.map(r => ({
    name:  r._id,
    value: r.total,
    count: r.count,
    color: colors[r._id] || '#636E72'
  }))

  successResponse(res, data)
})

export const getMonthlyTrend = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const months = parseInt(req.query.months || 6)
  const startDate = new Date()
  startDate.setMonth(startDate.getMonth() - months)

  const result = await Expense.aggregate([
    { $match: {
        $or: [{ paidBy: userId }, { 'splits.user': userId }],
        date: { $gte: startDate }
    }},
    { $group: {
        _id: { year: { $year: '$date' }, month: { $month: '$date' } },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
    }},
    { $sort: { '_id.year': 1, '_id.month': 1 } }
  ])

  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const data = result.map(r => ({
    month:  `${monthNames[r._id.month - 1]} ${r._id.year}`,
    amount: r.total,
    count:  r.count
  }))

  successResponse(res, data)
})

export const getSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const startDate = getPeriodStart(req.query.period || 'month')

  const [current, previous, topCategory, topSpender] = await Promise.all([
    Expense.aggregate([
      { $match: { $or: [{ paidBy: userId }, { 'splits.user': userId }], date: { $gte: startDate } }},
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Expense.aggregate([
      { $match: {
          $or: [{ paidBy: userId }, { 'splits.user': userId }],
          date: { $lt: startDate, $gte: new Date(startDate.getTime() - (startDate - getPeriodStart('6months'))) }
      }},
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]),
    Expense.aggregate([
      { $match: { $or: [{ paidBy: userId }, { 'splits.user': userId }], date: { $gte: startDate } }},
      { $group: { _id: '$category', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 }
    ]),
    Expense.aggregate([
      { $match: { date: { $gte: startDate } }},
      { $group: { _id: '$paidBy', total: { $sum: '$amount' } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
      { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
      { $unwind: '$user' }
    ])
  ])

  const currentTotal = current[0]?.total || 0
  const previousTotal = previous[0]?.total || 0
  const change = previousTotal > 0 ? ((currentTotal - previousTotal) / previousTotal * 100).toFixed(1) : 0

  successResponse(res, {
    totalThisPeriod:  currentTotal,
    expenseCount:     current[0]?.count || 0,
    percentageChange: parseFloat(change),
    topCategory:      topCategory[0] ? { name: topCategory[0]._id, amount: topCategory[0].total } : null,
    topSpender:       topSpender[0]  ? { name: topSpender[0].user.name, avatar: topSpender[0].user.avatar, amount: topSpender[0].total } : null,
  })
})

export const getTopSpenders = asyncHandler(async (req, res) => {
  const { groupId } = req.query
  const query = groupId ? { group: groupId } : {}

  const result = await Expense.aggregate([
    { $match: query },
    { $group: { _id: '$paidBy', total: { $sum: '$amount' }, count: { $sum: 1 } } },
    { $sort: { total: -1 } },
    { $limit: 5 },
    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
    { $unwind: '$user' },
    { $project: { name: '$user.name', avatar: '$user.avatar', total: 1, count: 1 } }
  ])

  successResponse(res, result)
})
