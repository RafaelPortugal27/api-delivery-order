// src/domain/repositories/ICustomerRepository.ts
import { Customer, CreateCustomerData } from '../entities/Customer'

export interface ICustomerRepository {
  findById(id: string): Promise<Customer | null>
  findByEmail(email: string): Promise<Customer | null>
  findByPhone(phone: string): Promise<Customer | null>
  create(data: CreateCustomerData): Promise<Customer>
  update(id: string, data: Partial<CreateCustomerData>): Promise<Customer>
}
