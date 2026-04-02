// src/domain/entities/Order.ts
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'READY'
  | 'DELIVERING'
  | 'DELIVERED'
  | 'CANCELLED'

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  unitPrice: number
  notes?: string | null
}

export interface Order {
  id: string
  storeId: string
  customerId: string
  addressId: string
  status: OrderStatus
  total: number
  notes?: string | null
  whatsappSent: boolean
  createdAt: Date
  updatedAt: Date
  items?: OrderItem[]
}

export interface CreateOrderItemData {
  productId: string
  quantity: number
  notes?: string
}

export interface CreateOrderData {
  storeId: string
  customerId: string
  addressId: string
  notes?: string
  items: CreateOrderItemData[]
}
