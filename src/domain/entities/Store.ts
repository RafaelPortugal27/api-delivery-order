// src/domain/entities/Store.ts
export interface Store {
  id: string
  name: string
  slug: string
  description?: string | null
  phone?: string | null
  logoUrl?: string | null
  address?: string | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface CreateStoreData {
  name: string
  slug: string
  description?: string
  phone?: string
  logoUrl?: string
  address?: string
}

export interface UpdateStoreData {
  name?: string
  description?: string
  phone?: string
  logoUrl?: string
  address?: string
  isActive?: boolean
}
