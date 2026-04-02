// src/infrastructure/http/middlewares/authMiddleware.ts
import { Request, Response, NextFunction } from 'express'
import { JwtTokenService } from '../../services/JwtTokenService'
import { AppError } from '../../../application/helpers/AppError'

const tokenService = new JwtTokenService()

export function customerAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido.', 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = tokenService.verify(token)

  if (payload.type !== 'customer') {
    throw new AppError('Acesso não autorizado.', 403)
  }

  req.customerId = payload.sub
  next()
}

export function storeUserAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AppError('Token não fornecido.', 401)
  }

  const token = authHeader.split(' ')[1]
  const payload = tokenService.verify(token)

  if (payload.type !== 'store_user') {
    throw new AppError('Acesso não autorizado.', 403)
  }

  req.storeUserId = payload.sub
  req.storeId = payload.storeId
  req.storeUserRole = payload.role
  next()
}

// Middleware para garantir que o storeId do token coincide com o da rota
export function tenantGuard(req: Request, _res: Response, next: NextFunction): void {
  const storeIdFromRoute = req.params.storeId ?? req.body.storeId
  if (storeIdFromRoute && storeIdFromRoute !== req.storeId) {
    throw new AppError('Acesso negado a este tenant.', 403)
  }
  next()
}

export function requireRole(...roles: string[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.storeUserRole || !roles.includes(req.storeUserRole)) {
      throw new AppError('Permissão insuficiente.', 403)
    }
    next()
  }
}
