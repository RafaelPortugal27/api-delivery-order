// src/infrastructure/http/routes/store.routes.ts
import { Router } from 'express'
import { StoreController } from '../controllers/StoreController'
import { ProductController } from '../controllers/ProductController'
import { OrderController } from '../controllers/OrderController'
import { storeUserAuth, requireRole } from '../middlewares/authMiddleware'

const router = Router()
const storeCtrl = new StoreController()
const productCtrl = new ProductController()
const orderCtrl = new OrderController()

// ── Store pública ──────────────────────────────────────────
// GET /stores/:slug            — info pública da loja
// GET /stores/:slug/menu       — cardápio público (só disponíveis)
router.get('/:slug', (req, res) => storeCtrl.get(req, res))
router.get('/:slug/menu', (req, res) => productCtrl.listPublic(req, res))

// ── Criar store (pode ser aberto ou protegido por uma admin key) ──
router.post('/', (req, res) => storeCtrl.create(req, res))

// ── Rotas protegidas do tenant ─────────────────────────────
// Todas as rotas abaixo exigem JWT de store_user e o storeId do
// token deve corresponder ao storeId da loja que está sendo gerenciada.

// Dados da loja
router.put(
  '/manage/info',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => storeCtrl.update(req, res),
)

// Usuários
router.get(
  '/manage/users',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => storeCtrl.listUsers(req, res),
)
router.post(
  '/manage/users',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => storeCtrl.addUser(req, res),
)

// Produtos
router.get('/manage/products', storeUserAuth, (req, res) => productCtrl.list(req, res))
router.post(
  '/manage/products',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => productCtrl.create(req, res),
)
router.put(
  '/manage/products/:id',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => productCtrl.update(req, res),
)
router.delete(
  '/manage/products/:id',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN'),
  (req, res) => productCtrl.delete(req, res),
)

// Pedidos
router.get('/manage/orders', storeUserAuth, (req, res) => orderCtrl.storeOrders(req, res))
router.patch(
  '/manage/orders/:orderId/status',
  storeUserAuth,
  requireRole('OWNER', 'ADMIN', 'STAFF'),
  (req, res) => orderCtrl.updateStatus(req, res),
)

export default router
