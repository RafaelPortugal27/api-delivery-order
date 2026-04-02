// src/domain/services/ITokenService.ts
export interface ITokenPayload {
  sub: string
  type: 'customer' | 'store_user'
  storeId?: string
  role?: string
}

export interface ITokenService {
  sign(payload: ITokenPayload): string
  verify(token: string): ITokenPayload
}
