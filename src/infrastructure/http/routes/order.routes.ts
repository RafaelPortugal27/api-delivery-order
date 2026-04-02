// src/infrastructure/http/routes/order.routes.ts
import { Router } from 'express'
import { OrderController } from '../controllers/OrderController'
import { customerAuth } from '../middlewares/authMiddleware'

const router = Router()
const orderCtrl = new OrderController()

// POST /orders/:storeSlug  — customer faz pedido em uma loja
router.post('/:storeSlug', customerAuth, (req, res) => orderCtrl.create(req, res))

export default router
