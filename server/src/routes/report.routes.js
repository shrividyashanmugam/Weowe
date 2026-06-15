import express from 'express'
import {
  getSummary, getByCategory, getMonthlyTrend, getTopSpenders
} from '../controllers/report.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/summary',       getSummary)
router.get('/by-category',   getByCategory)
router.get('/monthly-trend', getMonthlyTrend)
router.get('/top-spenders',  getTopSpenders)

export default router
