// src/application/use-cases/customer/RegisterCustomerUseCase.ts
import { Customer } from '../../../domain/entities/Customer'
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository'
import { AppError } from '../../helpers/AppError'

interface RegisterCustomerInput {
  name: string
  email: string
  phone: string
}

export class RegisterCustomerUseCase {
  constructor(private customerRepository: ICustomerRepository) {}

  async execute(input: RegisterCustomerInput): Promise<Customer> {
    const existingEmail = await this.customerRepository.findByEmail(input.email)
    if (existingEmail) {
      throw new AppError('Email já cadastrado.', 409)
    }

    const existingPhone = await this.customerRepository.findByPhone(input.phone)
    if (existingPhone) {
      throw new AppError('Telefone já cadastrado.', 409)
    }

    return this.customerRepository.create(input)
  }
}
