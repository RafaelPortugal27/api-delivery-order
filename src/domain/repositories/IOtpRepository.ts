// src/domain/repositories/IOtpRepository.ts
import { OtpCode, OtpChannel } from '../entities/OtpCode'

export interface IOtpRepository {
  create(data: {
    customerId?: string
    contact: string
    channel: OtpChannel
    code: string
    expiresAt: Date
  }): Promise<OtpCode>
  findValid(contact: string, code: string): Promise<OtpCode | null>
  markUsed(id: string): Promise<void>
  deleteExpired(): Promise<void>
}
