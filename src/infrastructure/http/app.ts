// src/infrastructure/http/app.ts
import 'express-async-errors'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'

import authRoutes from './routes/auth.routes'
import customerRoutes from './routes/customer.routes'
import storeRoutes from './routes/store.routes'
import orderRoutes from './routes/order.routes'
import { errorHandler } from './middlewares/errorHandler'

export function createApp() {
  const app = express()

  // ── Security & parsing ──────────────────────────────────
  app.use(helmet())
  app.use(cors())
  app.use(express.json())

  // ── Health check ────────────────────────────────────────
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() })
  })

  // ── Routes ──────────────────────────────────────────────
  app.use('/auth', authRoutes)
  app.use('/customers', customerRoutes)
  app.use('/stores', storeRoutes)
  app.use('/orders', orderRoutes)

  // ── Global error handler (must be last) ─────────────────
  app.use(errorHandler)

  return app
}
