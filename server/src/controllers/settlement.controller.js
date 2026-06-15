import Settlement from '../models/Settlement.model.js'
import Expense from '../models/Expense.model.js'
import Notification from '../models/Notification.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { simplifyDebts } from '../utils/debtSimplifier.js'

export const getSimplifiedDebts = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { groupId } = req.query

  const query = {
    $or: [{ paidBy: userId }, { 'splits.user': userId }],
    ...(groupId && { group: groupId })
  }

  const expenses = await Expense.find(query)
    .populate('splits.user', 'name avatar email')
    .populate('paidBy', 'name avatar email')

  const splits = []
  expenses.forEach(exp => {
    exp.splits.forEach(split => {
      if (!split.isPaid) {
        splits.push({
          userId: split.user._id,
          paidById: exp.paidBy._id,
          amount: split.amount
        })
      }
    })
  })

  const transactions = simplifyDebts(splits)

  const User = (await import('../models/User.model.js')).default
  const userIds = [...new Set(transactions.flatMap(t => [t.from, t.to]))]
  const users = await User.find({ _id: { $in: userIds } }).select('name avatar email')
  const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]))

  const populated = transactions.map(t => ({
    from:   userMap[t.from] || t.from,
    to:     userMap[t.to]   || t.to,
    amount: t.amount
  }))

  successResponse(res, populated)
})

export const getSettlements = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const { groupId } = req.query

  const query = {
    $or: [{ from: userId }, { to: userId }],
    ...(groupId && { group: groupId })
  }

  const settlements = await Settlement.find(query)
    .populate('from', 'name avatar email')
    .populate('to', 'name avatar email')
    .sort({ createdAt: -1 })

  successResponse(res, settlements)
})

export const createSettlement = asyncHandler(async (req, res) => {
  const { toId, amount, note, groupId } = req.body
  if (!toId || !amount) return errorResponse(res, 'Recipient and amount required')

  const settlement = await Settlement.create({
    from: req.user._id, to: toId, amount, note,
    group: groupId || null
  })

  Notification.create({
    user: toId,
    type: 'payment_received',
    message: `${req.user.name} is settling ₹${amount} with you`,
    metadata: { settlementId: settlement._id }
  }).catch(console.error)

  const populated = await settlement.populate([
    { path: 'from', select: 'name avatar email' },
    { path: 'to',   select: 'name avatar email' }
  ])

  successResponse(res, populated, 'Settlement created', 201)
})

export const markAsPaid = asyncHandler(async (req, res) => {
  const settlement = await Settlement.findById(req.params.id)
  if (!settlement) return errorResponse(res, 'Settlement not found', 404)
  if (settlement.from.toString() !== req.user._id.toString() &&
      settlement.to.toString()   !== req.user._id.toString())
    return errorResponse(res, 'Not authorized', 403)

  settlement.status = 'completed'
  settlement.paidAt = new Date()
  if (req.body.note) settlement.note = req.body.note
  await settlement.save()

  const notifyUserId = settlement.from.toString() === req.user._id.toString()
    ? settlement.to : settlement.from

  Notification.create({
    user: notifyUserId,
    type: 'payment_received',
    message: `${req.user.name} marked a ₹${settlement.amount} settlement as paid`,
    metadata: { settlementId: settlement._id }
  }).catch(console.error)

  const populated = await settlement.populate([
    { path: 'from', select: 'name avatar email' },
    { path: 'to',   select: 'name avatar email' }
  ])

  successResponse(res, populated, 'Marked as paid')
})
