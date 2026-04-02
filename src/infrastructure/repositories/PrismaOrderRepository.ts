// src/infrastructure/repositories/PrismaOrderRepository.ts
import { prisma } from '../database/prisma'
import { IOrderRepository } from '../../domain/repositories/IOrderRepository'
import { Order, CreateOrderData, OrderStatus } from '../../domain/entities/Order'

export class PrismaOrderRepository implements IOrderRepository {
  private toNumber(val: unknown): number {
    return Number(val)
  }

  private map(o: any): Order {
    return {
      ...o,
      total: this.toNumber(o.total),
      status: o.status as OrderStatus,
      items: o.items?.map((i: any) => ({
        ...i,
        unitPrice: this.toNumber(i.unitPrice),
      })),
    }
  }

  async findById(id: string): Promise<Order | null> {
    const o = await prisma.order.findUnique({
      where: { id },
      include: { items: true },
    })
    return o ? this.map(o) : null
  }

  async findByStoreId(storeId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { storeId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(this.map.bind(this))
  }

  async findByCustomerId(customerId: string): Promise<Order[]> {
    const orders = await prisma.order.findMany({
      where: { customerId },
      include: { items: true },
      orderBy: { createdAt: 'desc' },
    })
    return orders.map(this.map.bind(this))
  }

  async create(data: CreateOrderData): Promise<Order> {
    // Calcula total a partir dos itens
    const total = data.items.reduce(
      (sum, item) => sum + (item as any).unitPrice * item.quantity,
      0,
    )

    const o = await prisma.order.create({
      data: {
        storeId: data.storeId,
        customerId: data.customerId,
        addressId: data.addressId,
        notes: data.notes,
        total,
        items: {
          create: data.items.map((item) => ({
            productId: item.productId,
            quantity: item.quantity,
            unitPrice: (item as any).unitPrice,
            notes: item.notes,
          })),
        },
      },
      include: { items: true },
    })

    return this.map(o)
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const o = await prisma.order.update({
      where: { id },
      data: { status },
      include: { items: true },
    })
    return this.map(o)
  }

  async markWhatsappSent(id: string): Promise<void> {
    await prisma.order.update({ where: { id }, data: { whatsappSent: true } })
  }
}
