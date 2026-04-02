// src/infrastructure/http/middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '../../../application/helpers/AppError'
import { ZodError } from 'zod'

export function errorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message })
    return
  }

  if (err instanceof ZodError) {
    res.status(422).json({
      error: 'Dados inválidos.',
      details: err.errors.map((e) => ({ field: e.path.join('.'), message: e.message })),
    })
    return
  }

  console.error('[Unhandled Error]', err)
  res.status(500).json({ error: 'Erro interno no servidor.' })
}
