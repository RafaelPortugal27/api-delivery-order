// src/infrastructure/http/routes/customer.routes.ts
import { Router } from 'express'
import { CustomerController } from '../controllers/CustomerController'
import { AddressController } from '../controllers/AddressController'
import { OrderController } from '../controllers/OrderController'
import { customerAuth } from '../middlewares/authMiddleware'

const router = Router()
const customerCtrl = new CustomerController()
const addressCtrl = new AddressController()
const orderCtrl = new OrderController()

// POST /customers       — registro de novo customer (público)
// GET  /customers/me    — dados do customer autenticado
router.post('/', (req, res) => customerCtrl.register(req, res))
router.get('/me', customerAuth, (req, res) => customerCtrl.me(req, res))

// Endereços
router.get('/me/addresses', customerAuth, (req, res) => addressCtrl.list(req, res))
router.post('/me/addresses', customerAuth, (req, res) => addressCtrl.create(req, res))
router.delete('/me/addresses/:id', customerAuth, (req, res) => addressCtrl.delete(req, res))

// Pedidos do customer
router.get('/me/orders', customerAuth, (req, res) => orderCtrl.myOrders(req, res))

export default router
