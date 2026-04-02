// src/domain/services/INotificationService.ts
import { OtpChannel } from '../entities/OtpCode'

export interface ISendOtpPayload {
  to: string
  code: string
  channel: OtpChannel
}

export interface INotificationService {
  sendOtp(payload: ISendOtpPayload): Promise<void>
}
