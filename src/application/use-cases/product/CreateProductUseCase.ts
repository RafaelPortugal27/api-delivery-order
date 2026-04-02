// src/application/use-cases/product/CreateProductUseCase.ts
import { Product, CreateProductData } from '../../../domain/entities/Product'
import { IProductRepository } from '../../../domain/repositories/IProductRepository'

export class CreateProductUseCase {
  constructor(private productRepository: IProductRepository) {}

  async execute(data: CreateProductData): Promise<Product> {
    return this.productRepository.create(data)
  }
}
