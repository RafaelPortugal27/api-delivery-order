// src/infrastructure/http/controllers/ProductController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { CreateProductUseCase } from '../../../application/use-cases/product/CreateProductUseCase'
import { PrismaProductRepository } from '../../repositories/PrismaProductRepository'
import { AppError } from '../../../application/helpers/AppError'

const productRepo = new PrismaProductRepository()
const createProductUseCase = new CreateProductUseCase(productRepo)

const createSchema = z.object({
  categoryId: z.string().uuid().optional(),
  name: z.string().min(2),
  description: z.string().optional(),
  price: z.number().positive(),
  imageUrl: z.string().url().optional(),
})

const updateSchema = createSchema.extend({
  isAvailable: z.boolean().optional(),
}).partial()

export class ProductController {
  // Público — cardápio da loja
  async listPublic(req: Request, res: Response): Promise<void> {
    const { storeSlug } = req.params
    const { PrismaStoreRepository } = await import('../../repositories/PrismaStoreRepository')
    const storeRepo = new PrismaStoreRepository()
    const store = await storeRepo.findBySlug(storeSlug)
    if (!store) throw new AppError('Loja não encontrada.', 404)

    const products = await productRepo.findAvailableByStoreId(store.id)
    res.status(200).json(products)
  }

  // Gerenciamento pelo usuário da loja
  async list(req: Request, res: Response): Promise<void> {
    const products = await productRepo.findByStoreId(req.storeId!)
    res.status(200).json(products)
  }

  async create(req: Request, res: Response): Promise<void> {
    const data = createSchema.parse(req.body)
    const product = await createProductUseCase.execute({
      storeId: req.storeId!,
      ...data,
    })
    res.status(201).json(product)
  }

  async update(req: Request, res: Response): Promise<void> {
    const product = await productRepo.findById(req.params.id)
    if (!product) throw new AppError('Produto não encontrado.', 404)
    if (product.storeId !== req.storeId) throw new AppError('Acesso negado.', 403)

    const data = updateSchema.parse(req.body)
    const updated = await productRepo.update(req.params.id, data)
    res.status(200).json(updated)
  }

  async delete(req: Request, res: Response): Promise<void> {
    const product = await productRepo.findById(req.params.id)
    if (!product) throw new AppError('Produto não encontrado.', 404)
    if (product.storeId !== req.storeId) throw new AppError('Acesso negado.', 403)

    await productRepo.delete(req.params.id)
    res.status(204).send()
  }
}
