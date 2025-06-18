// @file: apps/server/src/interfaces/jwt.request.user.interface.ts

import { UserRole } from '@modulon/database'
export interface JwtRequestUser {
  id: string
  email: string
  role: UserRole
  exp: number
  iat: number
}