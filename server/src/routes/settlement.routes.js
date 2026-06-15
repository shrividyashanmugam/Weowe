import express from 'express'
import {
  getSettlements, createSettlement,
  markAsPaid, getSimplifiedDebts
} from '../controllers/settlement.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/simplified', getSimplifiedDebts)
router.get('/',           getSettlements)
router.post('/',          createSettlement)
router.put('/:id/pay',    markAsPaid)

export default router
