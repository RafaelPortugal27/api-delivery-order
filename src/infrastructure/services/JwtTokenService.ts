// src/infrastructure/services/JwtTokenService.ts
import jwt from 'jsonwebtoken'
import { ITokenService, ITokenPayload } from '../../domain/services/ITokenService'
import { AppError } from '../../application/helpers/AppError'

export class JwtTokenService implements ITokenService {
  private secret: string
  private expiresIn: string

  constructor() {
    this.secret = process.env.JWT_SECRET ?? 'changeme'
    this.expiresIn = process.env.JWT_EXPIRES_IN ?? '7d'
  }

  sign(payload: ITokenPayload): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn } as jwt.SignOptions)
  }

  verify(token: string): ITokenPayload {
    try {
      return jwt.verify(token, this.secret) as ITokenPayload
    } catch {
      throw new AppError('Token inválido ou expirado.', 401)
    }
  }
}
