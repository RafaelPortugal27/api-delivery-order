// src/domain/entities/Product.ts
export interface Product {
  id: string
  storeId: string
  categoryId?: string | null
  name: string
  description?: string | null
  price: number
  imageUrl?: string | null
  isAvailable: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateProductData {
  storeId: string
  categoryId?: string
  name: string
  description?: string
  price: number
  imageUrl?: string
}

export interface UpdateProductData {
  categoryId?: string | null
  name?: string
  description?: string
  price?: number
  imageUrl?: string
  isAvailable?: boolean
}
