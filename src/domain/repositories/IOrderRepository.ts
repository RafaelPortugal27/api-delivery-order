// src/domain/repositories/IOrderRepository.ts
import { Order, CreateOrderData, OrderStatus } from '../entities/Order'

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>
  findByStoreId(storeId: string): Promise<Order[]>
  findByCustomerId(customerId: string): Promise<Order[]>
  create(data: CreateOrderData): Promise<Order>
  updateStatus(id: string, status: OrderStatus): Promise<Order>
  markWhatsappSent(id: string): Promise<void>
}
