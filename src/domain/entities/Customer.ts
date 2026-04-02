// src/domain/entities/Customer.ts
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  createdAt: Date
  updatedAt: Date
}

export interface CreateCustomerData {
  name: string
  email: string
  phone: string
}
