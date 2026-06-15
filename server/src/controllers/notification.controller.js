import Notification from '../models/Notification.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'

export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)

  successResponse(res, notifications)
})

export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOne({
    _id: req.params.id,
    user: req.user._id
  })
  if (!notification) return errorResponse(res, 'Notification not found', 404)

  notification.isRead = true
  await notification.save()
  successResponse(res, notification, 'Marked as read')
})

export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany({ user: req.user._id, isRead: false }, { isRead: true })
  successResponse(res, null, 'All notifications marked as read')
})

export const deleteNotification = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  })
  if (!notification) return errorResponse(res, 'Notification not found', 404)
  successResponse(res, null, 'Notification deleted')
})

export const clearAll = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ user: req.user._id })
  successResponse(res, null, 'All notifications cleared')
})
