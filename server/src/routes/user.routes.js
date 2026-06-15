import express from 'express'
import { getProfile, updateProfile, uploadAvatarHandler, changePassword, deleteAccount, searchUsers, getUserStats } from '../controllers/user.controller.js'
import { protect } from '../middleware/auth.middleware.js'
import { uploadAvatar } from '../middleware/upload.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/search',            searchUsers)
router.get('/me',                getProfile)
router.put('/me',                updateProfile)
router.put('/me/avatar',         uploadAvatar, uploadAvatarHandler)
router.put('/me/password',       changePassword)
router.delete('/me',             deleteAccount)
router.get('/me/stats',          getUserStats)
router.get('/:id/stats',         getUserStats)

export default router
