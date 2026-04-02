// src/application/use-cases/auth/VerifyOtpUseCase.ts
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository'
import { IOtpRepository } from '../../../domain/repositories/IOtpRepository'
import { ITokenService } from '../../../domain/services/ITokenService'
import { AppError } from '../../helpers/AppError'

interface VerifyOtpInput {
  contact: string
  code: string
}

interface VerifyOtpOutput {
  token: string
  customerId: string
}

export class VerifyOtpUseCase {
  constructor(
    private customerRepository: ICustomerRepository,
    private otpRepository: IOtpRepository,
    private tokenService: ITokenService,
  ) {}

  async execute({ contact, code }: VerifyOtpInput): Promise<VerifyOtpOutput> {
    const otp = await this.otpRepository.findValid(contact, code)

    if (!otp) {
      throw new AppError('Código inválido ou expirado.', 401)
    }

    if (otp.usedAt) {
      throw new AppError('Código já utilizado.', 401)
    }

    if (new Date() > otp.expiresAt) {
      throw new AppError('Código expirado.', 401)
    }

    await this.otpRepository.markUsed(otp.id)

    const isEmail = contact.includes('@')
    const customer = isEmail
      ? await this.customerRepository.findByEmail(contact)
      : await this.customerRepository.findByPhone(contact)

    if (!customer) {
      throw new AppError('Customer não encontrado.', 404)
    }

    const token = this.tokenService.sign({
      sub: customer.id,
      type: 'customer',
    })

    return { token, customerId: customer.id }
  }
}
