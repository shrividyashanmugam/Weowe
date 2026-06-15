import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import User from '../models/User.model.js'
import asyncHandler from '../utils/asyncHandler.js'
import { successResponse, errorResponse } from '../utils/apiResponse.js'
import { sendEmail, emailTemplates } from '../config/mailer.js'

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
const generateRefreshToken = (id) => jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN })

export const register = asyncHandler(async (req, res) => {
  const { name, email, phone, password } = req.body
  if (!name || !email || !password) return errorResponse(res, 'Name, email and password are required')
  if (password.length < 6) return errorResponse(res, 'Password must be at least 6 characters')

  const existing = await User.findOne({ email })
  if (existing) return errorResponse(res, 'Email already registered', 409)

  const user = await User.create({ name, email, phone, password })

  const tmpl = emailTemplates.welcome(name)
  sendEmail({ to: email, ...tmpl }).catch(console.error)

  const token = generateToken(user._id)
  successResponse(res, { token, user }, 'Registration successful', 201)
})

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return errorResponse(res, 'Email and password required')

  const user = await User.findOne({ email }).select('+password')
  if (!user || !(await user.comparePassword(password)))
    return errorResponse(res, 'Invalid email or password', 401)

  const token = generateToken(user._id)
  const refreshToken = generateRefreshToken(user._id)

  user.refreshToken = refreshToken
  await user.save({ validateBeforeSave: false })

  successResponse(res, { token, refreshToken, user }, 'Login successful')
})

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: null })
  successResponse(res, null, 'Logged out successfully')
})

export const refreshToken = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body
  if (!refreshToken) return errorResponse(res, 'Refresh token required')
  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET)
    const user = await User.findById(decoded.id).select('+refreshToken')
    if (!user || user.refreshToken !== refreshToken)
      return errorResponse(res, 'Invalid refresh token', 401)
    const token = generateToken(user._id)
    successResponse(res, { token }, 'Token refreshed')
  } catch {
    errorResponse(res, 'Invalid or expired refresh token', 401)
  }
})

export const forgotPassword = asyncHandler(async (req, res) => {
  const user = await User.findOne({ email: req.body.email })
  if (!user) return successResponse(res, null, 'If that email exists, a reset link has been sent')

  const token = crypto.randomBytes(32).toString('hex')
  user.resetPasswordToken = token
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000
  await user.save({ validateBeforeSave: false })

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${token}`
  await sendEmail({
    to: user.email,
    subject: 'WeOwe Password Reset',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. Link expires in 1 hour.</p>`
  })

  successResponse(res, null, 'Password reset email sent')
})

export const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body
  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() }
  })
  if (!user) return errorResponse(res, 'Invalid or expired reset token')

  user.password = newPassword
  user.resetPasswordToken = undefined
  user.resetPasswordExpires = undefined
  await user.save()

  successResponse(res, null, 'Password reset successful')
})

export const verifyEmail = asyncHandler(async (req, res) => {
  const user = await User.findOne({ emailVerifyToken: req.params.token })
  if (!user) return errorResponse(res, 'Invalid verification token')
  user.emailVerified = true
  user.emailVerifyToken = undefined
  await user.save({ validateBeforeSave: false })
  successResponse(res, null, 'Email verified successfully')
})

export const getMe = asyncHandler(async (req, res) => {
  successResponse(res, req.user, 'Profile fetched')
})
