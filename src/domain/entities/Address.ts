// src/domain/entities/Address.ts
export interface Address {
  id: string
  customerId: string
  label?: string | null
  street: string
  number: string
  complement?: string | null
  neighborhood: string
  city: string
  state: string
  zipCode: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateAddressData {
  customerId: string
  label?: string
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
}
