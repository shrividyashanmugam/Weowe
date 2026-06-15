import jwt from 'jsonwebtoken'
import User from '../models/User.model.js'
import { errorResponse } from '../utils/apiResponse.js'

export const protect = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.startsWith('Bearer ')
      ? req.headers.authorization.split(' ')[1]
      : null

    if (!token) return errorResponse(res, 'Not authorized, no token', 401)

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    const user = await User.findById(decoded.id).select('-password')
    if (!user) return errorResponse(res, 'User not found', 401)

    req.user = user
    next()
  } catch (err) {
    return errorResponse(res, 'Not authorized, token invalid', 401)
  }
}
