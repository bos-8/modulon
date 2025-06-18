// @file: apps/server/src/interfaces/auth.interface.ts
import { UserRole } from '@modulon/database'

export interface TokenPair {
  accessToken: string
  refreshToken: string
}
export interface AuthResponse {
  user: {
    id: string
    email: string
    role: UserRole
  }
  tokens: TokenPair
}

export interface MeResponse {
  id: string
  email: string
  role: UserRole
  exp: number
}