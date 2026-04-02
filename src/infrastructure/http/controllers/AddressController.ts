// src/infrastructure/http/controllers/AddressController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { CreateAddressUseCase } from '../../../application/use-cases/address/CreateAddressUseCase'
import { ListAddressesUseCase } from '../../../application/use-cases/address/ListAddressesUseCase'
import { AppError } from '../../../application/helpers/AppError'
import { PrismaAddressRepository } from '../../repositories/PrismaAddressRepository'
import { PrismaCustomerRepository } from '../../repositories/PrismaCustomerRepository'

const addressRepo = new PrismaAddressRepository()
const customerRepo = new PrismaCustomerRepository()
const createAddressUseCase = new CreateAddressUseCase(addressRepo, customerRepo)
const listAddressesUseCase = new ListAddressesUseCase(addressRepo)

const createSchema = z.object({
  label: z.string().optional(),
  street: z.string().min(2),
  number: z.string().min(1),
  complement: z.string().optional(),
  neighborhood: z.string().min(2),
  city: z.string().min(2),
  state: z.string().length(2),
  zipCode: z.string().min(8).max(9),
})

export class AddressController {
  async create(req: Request, res: Response): Promise<void> {
    const data = createSchema.parse(req.body)
    const address = await createAddressUseCase.execute({
      customerId: req.customerId!,
      ...data,
    })
    res.status(201).json(address)
  }

  async list(req: Request, res: Response): Promise<void> {
    const addresses = await listAddressesUseCase.execute(req.customerId!)
    res.status(200).json(addresses)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const address = await addressRepo.findById(req.params.id)
    if (!address) throw new AppError('Endereço não encontrado.', 404)
    if (address.customerId !== req.customerId) throw new AppError('Acesso negado.', 403)
    await addressRepo.delete(req.params.id)
    res.status(204).send()
  }
}
