// src/application/use-cases/order/CreateOrderUseCase.ts
import { Order, CreateOrderData } from '../../../domain/entities/Order'
import { IOrderRepository } from '../../../domain/repositories/IOrderRepository'
import { IProductRepository } from '../../../domain/repositories/IProductRepository'
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository'
import { IStoreRepository } from '../../../domain/repositories/IStoreRepository'
import { IWhatsappService } from '../../../domain/services/IWhatsappService'
import { AppError } from '../../helpers/AppError'
import { formatOrderMessage } from '../../helpers/formatOrderMessage'

interface CreateOrderInput {
  storeId: string
  customerId: string
  addressId: string
  notes?: string
  items: Array<{ productId: string; quantity: number; notes?: string }>
}

export class CreateOrderUseCase {
  constructor(
    private orderRepository: IOrderRepository,
    private productRepository: IProductRepository,
    private addressRepository: IAddressRepository,
    private storeRepository: IStoreRepository,
    private whatsappService: IWhatsappService,
  ) {}

  async execute(input: CreateOrderInput): Promise<Order> {
    // Validar store
    const store = await this.storeRepository.findById(input.storeId)
    if (!store) throw new AppError('Loja não encontrada.', 404)
    if (!store.isActive) throw new AppError('Loja inativa.', 400)

    // Validar endereço pertence ao customer
    const address = await this.addressRepository.findById(input.addressId)
    if (!address) throw new AppError('Endereço não encontrado.', 404)
    if (address.customerId !== input.customerId) {
      throw new AppError('Endereço não pertence ao customer.', 403)
    }

    // Validar produtos e calcular total
    const enrichedItems: Array<{
      productId: string
      quantity: number
      unitPrice: number
      notes?: string
      productName: string
    }> = []

    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new AppError(`Quantidade inválida para o produto ${item.productId}.`, 400)
      }

      const product = await this.productRepository.findById(item.productId)
      if (!product) throw new AppError(`Produto ${item.productId} não encontrado.`, 404)
      if (product.storeId !== input.storeId) {
        throw new AppError(`Produto ${item.productId} não pertence a esta loja.`, 400)
      }
      if (!product.isAvailable) {
        throw new AppError(`Produto "${product.name}" não está disponível.`, 400)
      }

      enrichedItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price,
        notes: item.notes,
        productName: product.name,
      })
    }

    const total = enrichedItems.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    )

    // Criar o pedido
    const orderData: CreateOrderData = {
      storeId: input.storeId,
      customerId: input.customerId,
      addressId: input.addressId,
      notes: input.notes,
      items: enrichedItems.map(({ productId, quantity, unitPrice, notes }) => ({
        productId,
        quantity,
        unitPrice,
        notes,
      })),
    }

    const order = await this.orderRepository.create(orderData)

    // Enviar WhatsApp para a loja (não bloqueia a resposta se falhar)
    if (store.phone) {
      try {
        const message = formatOrderMessage({
          order,
          items: enrichedItems,
          address,
          storeName: store.name,
          total,
        })

        await this.whatsappService.sendMessage({
          to: store.phone,
          message,
        })

        await this.orderRepository.markWhatsappSent(order.id)
      } catch (error) {
        console.error('[WhatsApp] Falha ao enviar pedido:', error)
        // Não lança erro — pedido já foi criado
      }
    }

    return order
  }
}
