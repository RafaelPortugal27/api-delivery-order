// src/infrastructure/http/controllers/CustomerController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { RegisterCustomerUseCase } from '../../../application/use-cases/customer/RegisterCustomerUseCase'
import { PrismaCustomerRepository } from '../../repositories/PrismaCustomerRepository'

const customerRepo = new PrismaCustomerRepository()
const registerCustomerUseCase = new RegisterCustomerUseCase(customerRepo)

const registerSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(10),
})

export class CustomerController {
  async register(req: Request, res: Response): Promise<void> {
    const data = registerSchema.parse(req.body)
    const customer = await registerCustomerUseCase.execute(data)
    const { ...safe } = customer
    res.status(201).json(safe)
  }

  async me(req: Request, res: Response): Promise<void> {
    const customer = await customerRepo.findById(req.customerId!)
    if (!customer) {
      res.status(404).json({ error: 'Customer não encontrado.' })
      return
    }
    res.status(200).json(customer)
  }
}
