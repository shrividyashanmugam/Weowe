import express from 'express'
import {
  getFriends, sendFriendRequest, acceptRequest,
  rejectRequest, removeFriend, getFriendBalance, getPendingRequests
} from '../controllers/friend.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/',                       getFriends)
router.get('/requests',               getPendingRequests)
router.post('/request',               sendFriendRequest)
router.put('/:requestId/accept',      acceptRequest)
router.put('/:requestId/reject',      rejectRequest)
router.delete('/:friendId',           removeFriend)
router.get('/:friendId/balance',      getFriendBalance)

export default router
