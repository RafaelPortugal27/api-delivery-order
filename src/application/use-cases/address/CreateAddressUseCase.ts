// src/application/use-cases/address/CreateAddressUseCase.ts
import { Address, CreateAddressData } from '../../../domain/entities/Address'
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository'
import { ICustomerRepository } from '../../../domain/repositories/ICustomerRepository'
import { AppError } from '../../helpers/AppError'

export class CreateAddressUseCase {
  constructor(
    private addressRepository: IAddressRepository,
    private customerRepository: ICustomerRepository,
  ) {}

  async execute(data: CreateAddressData): Promise<Address> {
    const customer = await this.customerRepository.findById(data.customerId)
    if (!customer) {
      throw new AppError('Customer não encontrado.', 404)
    }

    return this.addressRepository.create(data)
  }
}
