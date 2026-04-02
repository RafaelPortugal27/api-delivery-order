// src/infrastructure/repositories/PrismaStoreUserRepository.ts
import { prisma } from '../database/prisma'
import { IStoreUserRepository } from '../../domain/repositories/IStoreUserRepository'
import { StoreUser, CreateStoreUserData } from '../../domain/entities/StoreUser'

export class PrismaStoreUserRepository implements IStoreUserRepository {
  private mapRole(role: string) {
    return role as StoreUser['role']
  }

  async findById(id: string): Promise<StoreUser | null> {
    const user = await prisma.storeUser.findUnique({ where: { id } })
    if (!user) return null
    return { ...user, role: this.mapRole(user.role) }
  }

  async findByEmailAndStore(email: string, storeId: string): Promise<StoreUser | null> {
    const user = await prisma.storeUser.findUnique({
      where: { email_storeId: { email, storeId } },
    })
    if (!user) return null
    return { ...user, role: this.mapRole(user.role) }
  }

  async findByStoreId(storeId: string): Promise<StoreUser[]> {
    const users = await prisma.storeUser.findMany({ where: { storeId } })
    return users.map((u) => ({ ...u, role: this.mapRole(u.role) }))
  }

  async create(data: CreateStoreUserData): Promise<StoreUser> {
    const user = await prisma.storeUser.create({ data })
    return { ...user, role: this.mapRole(user.role) }
  }

  async update(id: string, data: Partial<CreateStoreUserData>): Promise<StoreUser> {
    const user = await prisma.storeUser.update({ where: { id }, data })
    return { ...user, role: this.mapRole(user.role) }
  }

  async delete(id: string): Promise<void> {
    await prisma.storeUser.delete({ where: { id } })
  }
}
