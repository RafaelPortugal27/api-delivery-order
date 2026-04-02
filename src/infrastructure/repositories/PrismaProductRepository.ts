// src/infrastructure/repositories/PrismaProductRepository.ts
import { prisma } from '../database/prisma'
import { IProductRepository } from '../../domain/repositories/IProductRepository'
import { Product, CreateProductData, UpdateProductData } from '../../domain/entities/Product'

export class PrismaProductRepository implements IProductRepository {
  private toNumber(val: unknown): number {
    return typeof val === 'object' && val !== null && 'toNumber' in val
      ? (val as { toNumber(): number }).toNumber()
      : Number(val)
  }

  private map(p: any): Product {
    return { ...p, price: this.toNumber(p.price) }
  }

  async findById(id: string): Promise<Product | null> {
    const p = await prisma.product.findUnique({ where: { id } })
    return p ? this.map(p) : null
  }

  async findByStoreId(storeId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { storeId },
      orderBy: { name: 'asc' },
    })
    return products.map(this.map.bind(this))
  }

  async findAvailableByStoreId(storeId: string): Promise<Product[]> {
    const products = await prisma.product.findMany({
      where: { storeId, isAvailable: true },
      orderBy: { name: 'asc' },
    })
    return products.map(this.map.bind(this))
  }

  async create(data: CreateProductData): Promise<Product> {
    const p = await prisma.product.create({ data })
    return this.map(p)
  }

  async update(id: string, data: UpdateProductData): Promise<Product> {
    const p = await prisma.product.update({ where: { id }, data })
    return this.map(p)
  }

  async delete(id: string): Promise<void> {
    await prisma.product.delete({ where: { id } })
  }
}
