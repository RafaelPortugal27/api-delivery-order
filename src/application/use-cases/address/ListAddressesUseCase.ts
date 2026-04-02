// src/application/use-cases/address/ListAddressesUseCase.ts
import { Address } from '../../../domain/entities/Address'
import { IAddressRepository } from '../../../domain/repositories/IAddressRepository'

export class ListAddressesUseCase {
  constructor(private addressRepository: IAddressRepository) {}

  async execute(customerId: string): Promise<Address[]> {
    return this.addressRepository.findByCustomerId(customerId)
  }
}
