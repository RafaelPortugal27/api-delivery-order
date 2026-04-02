// src/infrastructure/repositories/PrismaAddressRepository.ts
import { prisma } from '../database/prisma'
import { IAddressRepository } from '../../domain/repositories/IAddressRepository'
import { Address, CreateAddressData } from '../../domain/entities/Address'

export class PrismaAddressRepository implements IAddressRepository {
  async findById(id: string): Promise<Address | null> {
    return prisma.address.findUnique({ where: { id } })
  }

  async findByCustomerId(customerId: string): Promise<Address[]> {
    return prisma.address.findMany({ where: { customerId }, orderBy: { createdAt: 'desc' } })
  }

  async create(data: CreateAddressData): Promise<Address> {
    return prisma.address.create({ data })
  }

  async update(id: string, data: Partial<CreateAddressData>): Promise<Address> {
    return prisma.address.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.address.delete({ where: { id } })
  }
}
