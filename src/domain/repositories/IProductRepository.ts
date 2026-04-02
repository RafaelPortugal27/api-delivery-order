// src/domain/repositories/IProductRepository.ts
import { Product, CreateProductData, UpdateProductData } from '../entities/Product'

export interface IProductRepository {
  findById(id: string): Promise<Product | null>
  findByStoreId(storeId: string): Promise<Product[]>
  findAvailableByStoreId(storeId: string): Promise<Product[]>
  create(data: CreateProductData): Promise<Product>
  update(id: string, data: UpdateProductData): Promise<Product>
  delete(id: string): Promise<void>
}
