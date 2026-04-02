// src/application/use-cases/auth/LoginStoreUserUseCase.ts
import bcrypt from 'bcryptjs'
import { IStoreUserRepository } from '../../../domain/repositories/IStoreUserRepository'
import { ITokenService } from '../../../domain/services/ITokenService'
import { AppError } from '../../helpers/AppError'

interface LoginStoreUserInput {
  email: string
  password: string
  storeId: string
}

interface LoginStoreUserOutput {
  token: string
  userId: string
  role: string
}

export class LoginStoreUserUseCase {
  constructor(
    private storeUserRepository: IStoreUserRepository,
    private tokenService: ITokenService,
  ) {}

  async execute({ email, password, storeId }: LoginStoreUserInput): Promise<LoginStoreUserOutput> {
    const user = await this.storeUserRepository.findByEmailAndStore(email, storeId)

    if (!user) {
      throw new AppError('Credenciais inválidas.', 401)
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      throw new AppError('Credenciais inválidas.', 401)
    }

    const token = this.tokenService.sign({
      sub: user.id,
      type: 'store_user',
      storeId: user.storeId,
      role: user.role,
    })

    return { token, userId: user.id, role: user.role }
  }
}
