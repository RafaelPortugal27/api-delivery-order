// src/domain/repositories/IAddressRepository.ts
import { Address, CreateAddressData } from '../entities/Address'

export interface IAddressRepository {
  findById(id: string): Promise<Address | null>
  findByCustomerId(customerId: string): Promise<Address[]>
  create(data: CreateAddressData): Promise<Address>
  update(id: string, data: Partial<CreateAddressData>): Promise<Address>
  delete(id: string): Promise<void>
}
