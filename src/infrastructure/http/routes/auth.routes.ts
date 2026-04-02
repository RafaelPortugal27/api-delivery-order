// src/infrastructure/http/routes/auth.routes.ts
import { Router } from 'express'
import { AuthController } from '../controllers/AuthController'

const router = Router()
const ctrl = new AuthController()

// POST /auth/otp/send    — customer solicita código
// POST /auth/otp/verify  — customer valida código e recebe JWT
// POST /auth/store/login — usuário da loja faz login com senha
router.post('/otp/send', (req, res) => ctrl.sendOtp(req, res))
router.post('/otp/verify', (req, res) => ctrl.verifyOtp(req, res))
router.post('/store/login', (req, res) => ctrl.loginStoreUser(req, res))

export default router
