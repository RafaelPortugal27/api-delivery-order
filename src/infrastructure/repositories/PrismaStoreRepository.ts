// src/infrastructure/repositories/PrismaStoreRepository.ts
import { prisma } from '../database/prisma'
import { IStoreRepository } from '../../domain/repositories/IStoreRepository'
import { Store, CreateStoreData, UpdateStoreData } from '../../domain/entities/Store'

export class PrismaStoreRepository implements IStoreRepository {
  async findById(id: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { id } })
  }

  async findBySlug(slug: string): Promise<Store | null> {
    return prisma.store.findUnique({ where: { slug } })
  }

  async findAll(): Promise<Store[]> {
    return prisma.store.findMany({ orderBy: { name: 'asc' } })
  }

  async create(data: CreateStoreData): Promise<Store> {
    return prisma.store.create({ data })
  }

  async update(id: string, data: UpdateStoreData): Promise<Store> {
    return prisma.store.update({ where: { id }, data })
  }

  async delete(id: string): Promise<void> {
    await prisma.store.delete({ where: { id } })
  }
}
