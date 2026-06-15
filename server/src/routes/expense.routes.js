import express from 'express'
import {
  getExpenses, createExpense, getExpenseById,
  updateExpense, deleteExpense, getExpenseSummary
} from '../controllers/expense.controller.js'
import { protect } from '../middleware/auth.middleware.js'

const router = express.Router()
router.use(protect)

router.get('/summary',  getExpenseSummary)
router.get('/',         getExpenses)
router.post('/',        createExpense)
router.get('/:id',      getExpenseById)
router.put('/:id',      updateExpense)
router.delete('/:id',   deleteExpense)

export default router
