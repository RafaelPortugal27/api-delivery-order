// src/domain/entities/StoreUser.ts
export type StoreUserRole = 'OWNER' | 'ADMIN' | 'STAFF'

export interface StoreUser {
  id: string
  storeId: string
  name: string
  email: string
  password: string
  role: StoreUserRole
  createdAt: Date
  updatedAt: Date
}

export interface CreateStoreUserData {
  storeId: string
  name: string
  email: string
  password: string
  role?: StoreUserRole
}
