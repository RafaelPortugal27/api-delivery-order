// src/shared/types/express.d.ts
declare namespace Express {
  interface Request {
    customerId?: string
    storeUserId?: string
    storeId?: string
    storeUserRole?: string
  }
}
