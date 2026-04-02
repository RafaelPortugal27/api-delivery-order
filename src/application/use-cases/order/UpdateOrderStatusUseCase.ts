// src/application/use-cases/order/UpdateOrderStatusUseCase.ts
import { Order, OrderStatus } from '../../../domain/entities/Order'
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository'
import { AppError } from '../../helpers/AppError'

interface UpdateOrderStatusInput {
  orderId: string
  storeId: string   // para garantir isolamento de tenant
  status: OrderStatus
}

const VALID_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING:    ['CONFIRMED', 'CANCELLED'],
  CONFIRMED:  ['PREPARING', 'CANCELLED'],
  PREPARING:  ['READY'],
  READY:      ['DELIVERING', 'DELIVERED'],
  DELIVERING: ['DELIVERED'],
  DELIVERED:  [],
  CANCELLED:  [],
}

export class UpdateOrderStatusUseCase {
  constructor(private orderRepository: IOrderRepository) {}

  async execute({ orderId, storeId, status }: UpdateOrderStatusInput): Promise<Order> {
    const order = await this.orderRepository.findById(orderId)

    if (!order) throw new AppError('Pedido não encontrado.', 404)
    if (order.storeId !== storeId) throw new AppError('Pedido não pertence a esta loja.', 403)

    const allowedNext = VALID_TRANSITIONS[order.status]
    if (!allowedNext.includes(status)) {
      throw new AppError(
        `Transição inválida: ${order.status} → ${status}. Permitidas: ${allowedNext.join(', ') || 'nenhuma'}`,
        400,
      )
    }

    return this.orderRepository.updateStatus(orderId, status)
  }
}
