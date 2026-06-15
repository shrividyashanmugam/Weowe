import Expense from '../models/Expense.model.js'
import Group from '../models/Group.model.js'
import Notification from '../models/Notification.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse, paginatedResponse } from '../utils/apiResponse.js'

export const getExpenses = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { page=1, limit=10, category, groupId, startDate, endDate, search, friendId } = req.query

  const query = {
    $or: [{ paidBy: userId }, { 'splits.user': userId }]
  }
  if (category)  query.category = category
  if (groupId)   query.group = groupId
  if (search)    query.title = { $regex: search, $options: 'i' }
  if (startDate || endDate) {
    query.date = {}
    if (startDate) query.date.$gte = new Date(startDate)
    if (endDate)   query.date.$lte = new Date(endDate)
  }
  if (friendId) {
    query.$and = [
      { $or: [{ paidBy: friendId }, { 'splits.user': friendId }] },
      { $or: [{ paidBy: userId }, { 'splits.user': userId }] }
    ]
    delete query.$or
  }

  const total = await Expense.countDocuments(query)
  const expenses = await Expense.find(query)
    .populate('paidBy', 'name avatar email')
    .populate('group', 'name emoji')
    .populate('splits.user', 'name avatar email')
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit))

  paginatedResponse(res, expenses, total, page, limit)
})

export const createExpense = asyncHandler(async (req, res) => {
  const { title, amount, category, date, description, groupId, paidById, splitMethod, splits } = req.body
  if (!title || !amount || !paidById) return errorResponse(res, 'Title, amount, and paidBy are required')
  if (!splits || !splits.length) return errorResponse(res, 'Splits are required')

  const totalSplit = splits.reduce((sum, s) => sum + s.amount, 0)
  if (Math.abs(totalSplit - amount) > 0.01)
    return errorResponse(res, `Split amounts (${totalSplit}) must equal total (${amount})`)

  const expense = await Expense.create({
    title, amount, category, date, description,
    group: groupId || null,
    paidBy: paidById,
    splitMethod,
    splits: splits.map(s => ({ user: s.userId, amount: s.amount, percent: s.percent })),
    createdBy: req.user._id
  })

  if (groupId) {
    await Group.findByIdAndUpdate(groupId, { $inc: { totalExpenses: amount } })
  }

  if (groupId) {
    const group = await Group.findById(groupId)
    const memberIds = group.members
      .map(m => m.user.toString())
      .filter(id => id !== req.user._id.toString())

    const notifications = memberIds.map(uid => ({
      user: uid,
      type: 'expense_added',
      message: `${req.user.name} added "${title}" (₹${amount}) to ${group.name}`,
      metadata: { expenseId: expense._id, groupId }
    }))
    Notification.insertMany(notifications).catch(console.error)
  }

  const populated = await expense.populate([
    { path: 'paidBy', select: 'name avatar email' },
    { path: 'splits.user', select: 'name avatar email' },
    { path: 'group', select: 'name emoji' }
  ])

  successResponse(res, populated, 'Expense created', 201)
})

export const getExpenseById = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
    .populate('paidBy', 'name avatar email')
    .populate('splits.user', 'name avatar email')
    .populate('group', 'name emoji')

  if (!expense) return errorResponse(res, 'Expense not found', 404)
  successResponse(res, expense)
})

export const updateExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
  if (!expense) return errorResponse(res, 'Expense not found', 404)
  if (expense.createdBy.toString() !== req.user._id.toString())
    return errorResponse(res, 'Not authorized to update this expense', 403)

  const updated = await Expense.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    .populate('paidBy', 'name avatar email')
    .populate('splits.user', 'name avatar email')

  successResponse(res, updated, 'Expense updated')
})

export const deleteExpense = asyncHandler(async (req, res) => {
  const expense = await Expense.findById(req.params.id)
  if (!expense) return errorResponse(res, 'Expense not found', 404)
  if (expense.createdBy.toString() !== req.user._id.toString())
    return errorResponse(res, 'Not authorized to delete this expense', 403)

  if (expense.group) {
    await Group.findByIdAndUpdate(expense.group, { $inc: { totalExpenses: -expense.amount } })
  }
  await expense.deleteOne()
  successResponse(res, null, 'Expense deleted')
})

export const getExpenseSummary = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { period = 'month' } = req.query

  const now = new Date()
  const startDate = period === 'month'
    ? new Date(now.getFullYear(), now.getMonth(), 1)
    : new Date(now.getFullYear(), 0, 1)

  const Settlement = (await import('../models/Settlement.model.js')).default

  const [youOwe, youAreOwed, totalExpenses, pendingSettlements] = await Promise.all([
    Expense.aggregate([
      { $unwind: '$splits' },
      { $match: { 'splits.user': userId, paidBy: { $ne: userId }, 'splits.isPaid': false } },
      { $group: { _id: null, total: { $sum: '$splits.amount' } } }
    ]),
    Expense.aggregate([
      { $match: { paidBy: userId } },
      { $unwind: '$splits' },
      { $match: { 'splits.user': { $ne: userId }, 'splits.isPaid': false } },
      { $group: { _id: null, total: { $sum: '$splits.amount' } } }
    ]),
    Expense.aggregate([
      { $match: { 'splits.user': userId, date: { $gte: startDate } } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Settlement.countDocuments({
      $or: [{ from: userId }, { to: userId }], status: 'pending'
    })
  ])

  successResponse(res, {
    youOwe:             youOwe[0]?.total || 0,
    youAreOwed:         youAreOwed[0]?.total || 0,
    netBalance:         (youAreOwed[0]?.total || 0) - (youOwe[0]?.total || 0),
    totalExpenses:      totalExpenses[0]?.total || 0,
    expenseCount:       totalExpenses[0]?.count || 0,
    pendingSettlements: pendingSettlements,
  })
})
