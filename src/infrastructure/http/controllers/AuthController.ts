// src/infrastructure/http/controllers/AuthController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { SendOtpUseCase } from '../../../application/use-cases/auth/SendOtpUseCase'
import { VerifyOtpUseCase } from '../../../application/use-cases/auth/VerifyOtpUseCase'
import { LoginStoreUserUseCase } from '../../../application/use-cases/auth/LoginStoreUserUseCase'
import { PrismaCustomerRepository } from '../../repositories/PrismaCustomerRepository'
import { PrismaOtpRepository } from '../../repositories/PrismaOtpRepository'
import { PrismaStoreUserRepository } from '../../repositories/PrismaStoreUserRepository'
import { NotificationService } from '../../services/NotificationService'
import { JwtTokenService } from '../../services/JwtTokenService'

const customerRepo = new PrismaCustomerRepository()
const otpRepo = new PrismaOtpRepository()
const storeUserRepo = new PrismaStoreUserRepository()
const notificationService = new NotificationService()
const tokenService = new JwtTokenService()

const sendOtpUseCase = new SendOtpUseCase(customerRepo, otpRepo, notificationService)
const verifyOtpUseCase = new VerifyOtpUseCase(customerRepo, otpRepo, tokenService)
const loginStoreUserUseCase = new LoginStoreUserUseCase(storeUserRepo, tokenService)

const sendOtpSchema = z.object({
  contact: z.string().min(1),
  channel: z.enum(['EMAIL', 'WHATSAPP', 'SMS']),
})

const verifyOtpSchema = z.object({
  contact: z.string().min(1),
  code: z.string().length(6),
})

const loginStoreUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  storeId: z.string().uuid(),
})

export class AuthController {
  async sendOtp(req: Request, res: Response): Promise<void> {
    const { contact, channel } = sendOtpSchema.parse(req.body)
    await sendOtpUseCase.execute({ contact, channel })
    res.status(200).json({ message: 'Código enviado com sucesso.' })
  }

  async verifyOtp(req: Request, res: Response): Promise<void> {
    const { contact, code } = verifyOtpSchema.parse(req.body)
    const result = await verifyOtpUseCase.execute({ contact, code })
    res.status(200).json(result)
  }

  async loginStoreUser(req: Request, res: Response): Promise<void> {
    const { email, password, storeId } = loginStoreUserSchema.parse(req.body)
    const result = await loginStoreUserUseCase.execute({ email, password, storeId })
    res.status(200).json(result)
  }
}
