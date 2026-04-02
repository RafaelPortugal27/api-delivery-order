// src/infrastructure/http/controllers/OrderController.ts
import { Request, Response } from 'express'
import { z } from 'zod'
import { CreateOrderUseCase } from '../../../application/use-cases/order/CreateOrderUseCase'
import { UpdateOrderStatusUseCase } from '../../../application/use-cases/order/UpdateOrderStatusUseCase'
import { PrismaOrderRepository } from '../../repositories/PrismaOrderRepository'
import { PrismaProductRepository } from '../../repositories/PrismaProductRepository'
import { PrismaAddressRepository } from '../../repositories/PrismaAddressRepository'
import { PrismaStoreRepository } from '../../repositories/PrismaStoreRepository'
import { TwilioWhatsappService } from '../../services/TwilioWhatsappService'
import { AppError } from '../../../application/helpers/AppError'

const orderRepo = new PrismaOrderRepository()
const productRepo = new PrismaProductRepository()
const addressRepo = new PrismaAddressRepository()
const storeRepo = new PrismaStoreRepository()
const whatsappService = new TwilioWhatsappService()

const createOrderUseCase = new CreateOrderUseCase(
  orderRepo,
  productRepo,
  addressRepo,
  storeRepo,
  whatsappService,
)
const updateOrderStatusUseCase = new UpdateOrderStatusUseCase(orderRepo)

const createOrderSchema = z.object({
  addressId: z.string().uuid(),
  notes: z.string().optional(),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1),
        notes: z.string().optional(),
      }),
    )
    .min(1),
})

const updateStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'PREPARING',
    'READY',
    'DELIVERING',
    'DELIVERED',
    'CANCELLED',
  ]),
})

export class OrderController {
  // Customer cria o pedido
  async create(req: Request, res: Response): Promise<void> {
    const { storeSlug } = req.params
    const store = await storeRepo.findBySlug(storeSlug)
    if (!store) throw new AppError('Loja não encontrada.', 404)

    const data = createOrderSchema.parse(req.body)
    const order = await createOrderUseCase.execute({
      storeId: store.id,
      customerId: req.customerId!,
      ...data,
    })
    res.status(201).json(order)
  }

  // Customer lista seus pedidos
  async myOrders(req: Request, res: Response): Promise<void> {
    const orders = await orderRepo.findByCustomerId(req.customerId!)
    res.status(200).json(orders)
  }

  // Store lista pedidos do tenant
  async storeOrders(req: Request, res: Response): Promise<void> {
    const orders = await orderRepo.findByStoreId(req.storeId!)
    res.status(200).json(orders)
  }

  // Store atualiza status do pedido
  async updateStatus(req: Request, res: Response): Promise<void> {
    const { status } = updateStatusSchema.parse(req.body)
    const order = await updateOrderStatusUseCase.execute({
      orderId: req.params.orderId,
      storeId: req.storeId!,
      status,
    })
    res.status(200).json(order)
  }
}
