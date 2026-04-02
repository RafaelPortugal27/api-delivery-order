// src/domain/repositories/IStoreUserRepository.ts
import { StoreUser, CreateStoreUserData } from '../entities/StoreUser'

export interface IStoreUserRepository {
  findById(id: string): Promise<StoreUser | null>
  findByEmailAndStore(email: string, storeId: string): Promise<StoreUser | null>
  findByStoreId(storeId: string): Promise<StoreUser[]>
  create(data: CreateStoreUserData): Promise<StoreUser>
  update(id: string, data: Partial<CreateStoreUserData>): Promise<StoreUser>
  delete(id: string): Promise<void>
}
