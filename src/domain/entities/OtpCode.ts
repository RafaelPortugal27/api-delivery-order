// src/domain/entities/OtpCode.ts
export type OtpChannel = 'EMAIL' | 'WHATSAPP' | 'SMS'

export interface OtpCode {
  id: string
  customerId?: string | null
  contact: string
  channel: OtpChannel
  code: string
  expiresAt: Date
  usedAt?: Date | null
  createdAt: Date
}
