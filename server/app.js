import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { errorHandler } from './src/middleware/error.middleware.js'

import authRoutes         from './src/routes/auth.routes.js'
import userRoutes         from './src/routes/user.routes.js'
import groupRoutes        from './src/routes/group.routes.js'
import expenseRoutes      from './src/routes/expense.routes.js'
import friendRoutes       from './src/routes/friend.routes.js'
import settlementRoutes   from './src/routes/settlement.routes.js'
import notificationRoutes from './src/routes/notification.routes.js'
import reportRoutes       from './src/routes/report.routes.js'

const app = express()

app.use(helmet())
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}))
app.use(morgan('dev'))
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests, please try again later.' }
}))

app.use('/api/auth',          authRoutes)
app.use('/api/users',         userRoutes)
app.use('/api/groups',        groupRoutes)
app.use('/api/expenses',      expenseRoutes)
app.use('/api/friends',       friendRoutes)
app.use('/api/settlements',   settlementRoutes)
app.use('/api/notifications', notificationRoutes)
app.use('/api/reports',       reportRoutes)

app.get('/api/health', (req, res) =>
  res.json({ status: 'OK', message: 'WeOwe API is running', timestamp: new Date() })
)

app.use('*', (req, res) =>
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` })
)

app.use(errorHandler)
export default app
