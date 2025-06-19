// @file: server/src/interfaces/jwt.request.user.interface.ts

import { UserRole } from '@modulon/types'
export interface JwtRequestUser {
  id: string
  email: string
  role: UserRole
  exp: number
  iat: number
}