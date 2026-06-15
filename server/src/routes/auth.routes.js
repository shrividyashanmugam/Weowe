import express from 'express'
import {
  register, login, logout, refreshToken,
  forgotPassword, resetPassword, verifyEmail, getMe
} from '../controllers/auth.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import rateLimit from 'express-rate-limit'

const router = express.Router()

const authLimiter = rateLimit({ windowMs: 15*60*1000, max: 10 })

router.post('/register',       authLimiter, register)
router.post('/login',          authLimiter, login)
router.post('/logout',         protect, logout)
router.post('/refresh',        refreshToken)
router.post('/forgot-password',authLimiter, forgotPassword)
router.post('/reset-password', resetPassword)
router.get('/verify-email/:token', verifyEmail)
router.get('/me',              protect, getMe)

export default router
