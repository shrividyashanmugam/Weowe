import Group from '../models/Group.model.js'
import Expense from '../models/Expense.model.js'
import Settlement from '../models/Settlement.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { simplifyDebts } from '../utils/debtSimplifier.js'

export const getGroups = asyncHandler(async (req, res) => {
  const groups = await Group.find({ 'members.user': req.user._id })
    .populate('owner', 'name avatar email')
    .populate('members.user', 'name avatar email')
    .sort({ updatedAt: -1 })

  successResponse(res, groups)
})

export const createGroup = asyncHandler(async (req, res) => {
  const { name, emoji, description, memberIds = [] } = req.body
  if (!name) return errorResponse(res, 'Group name is required')

  const members = [
    { user: req.user._id, role: 'owner' },
    ...memberIds
      .filter(id => id !== req.user._id.toString())
      .map(id => ({ user: id, role: 'member' }))
  ]

  const group = await Group.create({
    name, emoji, description,
    owner: req.user._id,
    members
  })

  const populated = await group.populate([
    { path: 'owner', select: 'name avatar email' },
    { path: 'members.user', select: 'name avatar email' }
  ])

  successResponse(res, populated, 'Group created', 201)
})

export const getGroupById = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
    .populate('owner', 'name avatar email')
    .populate('members.user', 'name avatar email')

  if (!group) return errorResponse(res, 'Group not found', 404)
  if (!group.members.some(m => m.user._id.toString() === req.user._id.toString()))
    return errorResponse(res, 'Not authorized', 403)

  successResponse(res, group)
})

export const updateGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)
  if (group.owner.toString() !== req.user._id.toString())
    return errorResponse(res, 'Only owner can update group', 403)

  const { name, emoji, description, status } = req.body
  if (name) group.name = name
  if (emoji) group.emoji = emoji
  if (description !== undefined) group.description = description
  if (status) group.status = status
  await group.save()

  const populated = await group.populate([
    { path: 'owner', select: 'name avatar email' },
    { path: 'members.user', select: 'name avatar email' }
  ])

  successResponse(res, populated, 'Group updated')
})

export const deleteGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)
  if (group.owner.toString() !== req.user._id.toString())
    return errorResponse(res, 'Only owner can delete group', 403)

  await group.deleteOne()
  successResponse(res, null, 'Group deleted')
})

export const addMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)
  if (group.owner.toString() !== req.user._id.toString())
    return errorResponse(res, 'Only owner can add members', 403)

  const { userId } = req.body
  if (!userId) return errorResponse(res, 'userId required')

  if (group.members.some(m => m.user.toString() === userId))
    return errorResponse(res, 'User already a member')

  group.members.push({ user: userId, role: 'member' })
  await group.save()

  const populated = await group.populate([
    { path: 'owner', select: 'name avatar email' },
    { path: 'members.user', select: 'name avatar email' }
  ])

  successResponse(res, populated, 'Member added')
})

export const removeMember = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)

  const userId = req.params.userId
  if (userId === group.owner.toString())
    return errorResponse(res, 'Cannot remove group owner')

  const isOwner = group.owner.toString() === req.user._id.toString()
  const isSelf = userId === req.user._id.toString()
  if (!isOwner && !isSelf) return errorResponse(res, 'Not authorized', 403)

  group.members = group.members.filter(m => m.user.toString() !== userId)
  await group.save()

  successResponse(res, null, 'Member removed')
})

export const getGroupBalances = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)

  const expenses = await Expense.find({ group: req.params.id })
    .populate('splits.user', 'name avatar email')
    .populate('paidBy', 'name avatar email')

  const balances = {}
  group.members.forEach(m => {
    balances[m.user.toString()] = { paid: 0, owes: 0, net: 0 }
  })

  expenses.forEach(exp => {
    const paidById = exp.paidBy._id.toString()
    balances[paidById].paid += exp.amount
    exp.splits.forEach(split => {
      const uid = split.user._id.toString()
      if (balances[uid]) balances[uid].owes += split.amount
    })
  })

  Object.keys(balances).forEach(uid => {
    balances[uid].net = balances[uid].paid - balances[uid].owes
  })

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

  const simplified = simplifyDebts(splits)

  successResponse(res, { balances, simplified })
})

export const settleGroup = asyncHandler(async (req, res) => {
  const group = await Group.findById(req.params.id)
  if (!group) return errorResponse(res, 'Group not found', 404)
  if (group.owner.toString() !== req.user._id.toString())
    return errorResponse(res, 'Only owner can settle group', 403)

  group.status = 'settled'
  await group.save()
  successResponse(res, group, 'Group marked as settled')
})
