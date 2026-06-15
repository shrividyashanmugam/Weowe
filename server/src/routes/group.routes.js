import express from 'express'
import {
  getGroups, createGroup, getGroupById,
  updateGroup, deleteGroup, addMember,
  removeMember, getGroupBalances, settleGroup
} from '../controllers/group.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/',              getGroups)
router.post('/',             createGroup)
router.get('/:id',           getGroupById)
router.put('/:id',           updateGroup)
router.delete('/:id',        deleteGroup)
router.post('/:id/members',  addMember)
router.delete('/:id/members/:userId', removeMember)
router.get('/:id/balances',  getGroupBalances)
router.post('/:id/settle',   settleGroup)

export default router
