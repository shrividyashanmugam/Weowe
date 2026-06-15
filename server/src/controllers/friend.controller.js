import Friendship from '../models/Friendship.model.js'
import User from '../models/User.model.js'
import Expense from '../models/Expense.model.js'
import Notification from '../models/Notification.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { sendEmail, emailTemplates } from '../config/mailer.js'

export const getFriends = asyncHandler(async (req, res) => {
  const userId = req.user._id

  const friendships = await Friendship.find({
    $or: [{ requester: userId }, { receiver: userId }],
    status: 'accepted'
  }).populate('requester', 'name email avatar phone')
    .populate('receiver', 'name email avatar phone')

  const friends = friendships.map(f => {
    const friend = f.requester._id.toString() === userId.toString() ? f.receiver : f.requester
    return { ...friend.toObject(), friendshipId: f._id }
  })

  successResponse(res, friends)
})

export const getPendingRequests = asyncHandler(async (req, res) => {
  const requests = await Friendship.find({
    receiver: req.user._id,
    status: 'pending'
  }).populate('requester', 'name email avatar')

  successResponse(res, requests)
})

export const sendFriendRequest = asyncHandler(async (req, res) => {
  const { email, message } = req.body
  if (!email) return errorResponse(res, 'Email is required')

  const target = await User.findOne({ email })
  if (!target) return errorResponse(res, 'User not found', 404)
  if (target._id.toString() === req.user._id.toString())
    return errorResponse(res, 'Cannot add yourself')

  const existing = await Friendship.findOne({
    $or: [
      { requester: req.user._id, receiver: target._id },
      { requester: target._id, receiver: req.user._id }
    ]
  })
  if (existing) {
    if (existing.status === 'accepted') return errorResponse(res, 'Already friends')
    if (existing.status === 'pending') return errorResponse(res, 'Request already pending')
  }

  const friendship = await Friendship.create({
    requester: req.user._id,
    receiver: target._id,
    status: 'pending'
  })

  Notification.create({
    user: target._id,
    type: 'friend_request',
    message: `${req.user.name} sent you a friend request`,
    metadata: { friendshipId: friendship._id, requesterId: req.user._id }
  }).catch(console.error)

  const tmpl = emailTemplates.friendRequest(req.user.name, target.name)
  sendEmail({ to: target.email, ...tmpl }).catch(console.error)

  successResponse(res, friendship, 'Friend request sent', 201)
})

export const acceptRequest = asyncHandler(async (req, res) => {
  const friendship = await Friendship.findById(req.params.requestId)
  if (!friendship) return errorResponse(res, 'Request not found', 404)
  if (friendship.receiver.toString() !== req.user._id.toString())
    return errorResponse(res, 'Not authorized', 403)

  friendship.status = 'accepted'
  await friendship.save()

  successResponse(res, friendship, 'Friend request accepted')
})

export const rejectRequest = asyncHandler(async (req, res) => {
  const friendship = await Friendship.findById(req.params.requestId)
  if (!friendship) return errorResponse(res, 'Request not found', 404)
  if (friendship.receiver.toString() !== req.user._id.toString())
    return errorResponse(res, 'Not authorized', 403)

  friendship.status = 'rejected'
  await friendship.save()

  successResponse(res, null, 'Friend request rejected')
})

export const removeFriend = asyncHandler(async (req, res) => {
  const friendId = req.params.friendId
  const friendship = await Friendship.findOne({
    $or: [
      { requester: req.user._id, receiver: friendId },
      { requester: friendId, receiver: req.user._id }
    ],
    status: 'accepted'
  })

  if (!friendship) return errorResponse(res, 'Friendship not found', 404)
  await friendship.deleteOne()
  successResponse(res, null, 'Friend removed')
})

export const getFriendBalance = asyncHandler(async (req, res) => {
  const userId = req.user._id
  const friendId = req.params.friendId

  const expenses = await Expense.find({
    $or: [
      { paidBy: userId, 'splits.user': friendId },
      { paidBy: friendId, 'splits.user': userId }
    ]
  })

  let youOwe = 0
  let theyOwe = 0

  expenses.forEach(exp => {
    exp.splits.forEach(split => {
      if (!split.isPaid) {
        if (exp.paidBy.toString() === friendId.toString() && split.user.toString() === userId.toString())
          youOwe += split.amount
        if (exp.paidBy.toString() === userId.toString() && split.user.toString() === friendId.toString())
          theyOwe += split.amount
      }
    })
  })

  successResponse(res, {
    youOwe,
    theyOwe,
    netBalance: theyOwe - youOwe,
    settled: youOwe === 0 && theyOwe === 0
  })
})
