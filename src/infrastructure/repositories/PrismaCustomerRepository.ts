// src/infrastructure/repositories/PrismaCustomerRepository.ts
import { prisma } from '../database/prisma'
import { ICustomerRepository } from '../../domain/repositories/ICustomerRepository'
import { Customer, CreateCustomerData } from '../../domain/entities/Customer'

export class PrismaCustomerRepository implements ICustomerRepository {
  async findById(id: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { id } })
  }

  async findByEmail(email: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { email } })
  }

  async findByPhone(phone: string): Promise<Customer | null> {
    return prisma.customer.findUnique({ where: { phone } })
  }

  async create(data: CreateCustomerData): Promise<Customer> {
    return prisma.customer.create({ data })
  }

  async update(id: string, data: Partial<CreateCustomerData>): Promise<Customer> {
    return prisma.customer.update({ where: { id }, data })
  }
}
