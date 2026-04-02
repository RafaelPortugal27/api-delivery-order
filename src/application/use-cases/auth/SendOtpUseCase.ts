// src/application/use-cases/auth/SendOtpUseCase.ts
import { randomInt } from 'crypto'
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository'
import { IOtpRepository } from '../../../domain/repositories/IOtpRepository'
import { INotificationService } from '../../../domain/services/INotificationService'
import { OtpChannel } from '../../../domain/entities/OtpCode'
import { AppError } from '../../helpers/AppError'

interface SendOtpInput {
  contact: string   // email ou telefone
  channel: OtpChannel
}

export class SendOtpUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private otpRepository: IOtpRepository,
    private notificationService: INotificationService,
  ) {}

  async execute({ contact, channel }: SendOtpInput): Promise<void> {
    const isEmail = channel === 'EMAIL'

    // Verifica se o customer existe
    const customer = isEmail
      ? await this.customerRepository.findByEmail(contact)
      : await this.customerRepository.findByPhone(contact)

    if (!customer) {
      throw new AppError('Customer não encontrado com esse contato.', 404)
    }

    // Gera código OTP de 6 dígitos
    const code = String(randomInt(100000, 999999))

    const expiresAt = new Date()
    const expiresInMinutes = Number(process.env.OTP_EXPIRES_IN_MINUTES ?? 10)
    expiresAt.setMinutes(expiresAt.getMinutes() + expiresInMinutes)

    await this.otpRepository.create({
      customerId: customer.id,
      contact,
      channel,
      code,
      expiresAt,
    })

    await this.notificationService.sendOtp({ to: contact, code, channel })
  }
}
