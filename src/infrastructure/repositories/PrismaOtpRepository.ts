// src/infrastructure/repositories/PrismaOtpRepository.ts
import { prisma } from '../database/prisma'
import { IOtpRepository } from '../../domain/repositories/IOtpRepository'
import { OtpCode, OtpChannel } from '../../domain/entities/OtpCode'

export class PrismaOtpRepository implements IOtpRepository {
  async create(data: {
    customerId?: string
    contact: string
    channel: OtpChannel
    code: string
    expiresAt: Date
  }): Promise<OtpCode> {
    const otp = await prisma.otpCode.create({ data })
    return { ...otp, channel: otp.channel as OtpChannel }
  }

  async findValid(contact: string, code: string): Promise<OtpCode | null> {
    const otp = await prisma.otpCode.findFirst({
      where: {
        contact,
        code,
        usedAt: null,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })
    if (!otp) return null
    return { ...otp, channel: otp.channel as OtpChannel }
  }

  async markUsed(id: string): Promise<void> {
    await prisma.otpCode.update({ where: { id }, data: { usedAt: new Date() } })
  }

  async deleteExpired(): Promise<void> {
    await prisma.otpCode.deleteMany({ where: { expiresAt: { lt: new Date() } } })
  }
}
