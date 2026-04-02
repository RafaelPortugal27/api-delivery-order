// src/domain/repositories/IStoreRepository.ts
import { Store, CreateStoreData, UpdateStoreData } from '../entities/Store'

export interface IStoreRepository {
  findById(id: string): Promise<Store | null>
  findBySlug(slug: string): Promise<Store | null>
  findAll(): Promise<Store[]>
  create(data: CreateStoreData): Promise<Store>
  update(id: string, data: UpdateStoreData): Promise<Store>
  delete(id: string): Promise<void>
}
