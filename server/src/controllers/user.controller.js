import User from '../models/User.model.js'
import Group from '../models/Group.model.js'
import Friendship from '../models/Friendship.model.js'
import Expense from '../models/Expense.model.js'
import cloudinary from '../config/cloudinary.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getProfile = asyncHandler(async (req, res) => {
  successResponse(res, req.user, 'Profile fetched')
})

export const updateProfile = asyncHandler(async (req, res) => {
  const allowed = ['name', 'phone', 'bio', 'currency', 'theme', 'language', 'notificationPrefs', 'privacy']
  const updates = {}
  allowed.forEach(key => {
    if (req.body[key] !== undefined) updates[key] = req.body[key]
  })

  const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true })
  successResponse(res, user, 'Profile updated')
})

export const uploadAvatarHandler = asyncHandler(async (req, res) => {
  if (!req.file) return errorResponse(res, 'No image uploaded')

  const user = await User.findById(req.user._id)
  if (user.avatarPublicId) {
    cloudinary.uploader.destroy(user.avatarPublicId).catch(console.error)
  }

  user.avatar = req.file.path
  user.avatarPublicId = req.file.filename
  await user.save({ validateBeforeSave: false })

  successResponse(res, user, 'Avatar updated')
})

export const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body
  if (!currentPassword || !newPassword) return errorResponse(res, 'Current and new password required')
  if (newPassword.length < 6) return errorResponse(res, 'Password must be at least 6 characters')

  const user = await User.findById(req.user._id).select('+password')
  if (!(await user.comparePassword(currentPassword)))
    return errorResponse(res, 'Current password is incorrect', 401)

  user.password = newPassword
  await user.save()
  successResponse(res, null, 'Password changed successfully')
})

export const deleteAccount = asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user._id)
  successResponse(res, null, 'Account deleted')
})

export const searchUsers = asyncHandler(async (req, res) => {
  const { q } = req.query
  if (!q || q.length < 2) return errorResponse(res, 'Search query must be at least 2 characters')

  const users = await User.find({
    $and: [
      { _id: { $ne: req.user._id } },
      { $or: [
        { name: { $regex: q, $options: 'i' } },
        { email: { $regex: q, $options: 'i' } }
      ]}
    ]
  }).select('name email avatar').limit(10)

  successResponse(res, users)
})

export const getUserStats = asyncHandler(async (req, res) => {
  const userId = req.params.id === 'me' ? req.user._id : req.params.id

  const [expenseAgg, groupCount, friendCount] = await Promise.all([
    Expense.aggregate([
      { $match: { 'splits.user': userId } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } }
    ]),
    Group.countDocuments({ 'members.user': userId }),
  Friendship.countDocuments({
    $or: [{ requester: userId }, { receiver: userId }],
    status: 'accepted'
  })
  ])

  successResponse(res, {
    totalExpenses: expenseAgg[0]?.total || 0,
    expenseCount:  expenseAgg[0]?.count || 0,
    groups:        groupCount,
    friends:       friendCount,
  })
})
