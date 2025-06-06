// @file: server/src/interfaces/jwt.request.user.interface.ts

import { UserRole } from '@prisma/client'

export interface JwtRequestUser {
  id: string
  email: string
  role: UserRole
  exp: number
  iat: number
}
// EOF
