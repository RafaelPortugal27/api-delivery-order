// src/infrastructure/http/controllers/StoreController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import bcrypt from 'bcryptjs'
import { PrismaStoreRepository } from '../../repositories/PrismaStoreRepository'
import { PrismaStoreUserRepository } from '../../repositories/PrismaStoreUserRepository'
import { AppError } from '../../../application/helpers/AppError'

const storeRepo = new PrismaStoreRepository()
const storeUserRepo = new PrismaStoreUserRepository()

const createStoreSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hífens'),
  description: z.string().optional(),
  phone: z.string().optional(),
  ownerName: z.string().min(2),
  ownerEmail: z.string().email(),
  ownerPassword: z.string().min(6),
})

const updateStoreSchema = z.object({
  name: z.string().min(2).optional(),
  description: z.string().optional(),
  phone: z.string().optional(),
  logoUrl: z.string().url().optional(),
  address: z.string().optional(),
  isActive: z.boolean().optional(),
})

export class StoreController {
  // Criar nova store + owner (operação pública/admin)
  async create(req: Request, res: Response): Promise<void> {
    const data = createStoreSchema.parse(req.body)

    const existing = await storeRepo.findBySlug(data.slug)
    if (existing) throw new AppError('Slug já em uso.', 409)

    const store = await storeRepo.create({
      name: data.name,
      slug: data.slug,
      description: data.description,
      phone: data.phone,
    })

    const hashedPassword = await bcrypt.hash(data.ownerPassword, 12)
    const owner = await storeUserRepo.create({
      storeId: store.id,
      name: data.ownerName,
      email: data.ownerEmail,
      password: hashedPassword,
      role: 'OWNER',
    })

    res.status(201).json({
      store,
      owner: { id: owner.id, name: owner.name, email: owner.email, role: owner.role },
    })
  }

  async get(req: Request, res: Response): Promise<void> {
    const store = await storeRepo.findBySlug(req.params.slug)
    if (!store) throw new AppError('Loja não encontrada.', 404)
    res.status(200).json(store)
  }

  async update(req: Request, res: Response): Promise<void> {
    const data = updateStoreSchema.parse(req.body)
    const store = await storeRepo.update(req.storeId!, data)
    res.status(200).json(store)
  }

  // Adicionar usuário à store (somente OWNER/ADMIN)
  async addUser(req: Request, res: Response): Promise<void> {
    const schema = z.object({
      name: z.string().min(2),
      email: z.string().email(),
      password: z.string().min(6),
      role: z.enum(['ADMIN', 'STAFF']).default('STAFF'),
    })

    const data = schema.parse(req.body)

    const existing = await storeUserRepo.findByEmailAndStore(data.email, req.storeId!)
    if (existing) throw new AppError('Usuário com este email já existe nesta loja.', 409)

    const hashedPassword = await bcrypt.hash(data.password, 12)
    const user = await storeUserRepo.create({
      storeId: req.storeId!,
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
    })

    res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role })
  }

  async listUsers(req: Request, res: Response): Promise<void> {
    const users = await storeUserRepo.findByStoreId(req.storeId!)
    res.status(200).json(
      users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role })),
    )
  }
}
