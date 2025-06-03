// @file: apps/client/src/types/auth.ts
// @description Common authentication types for context and API responses
export enum UserRole {
  ROOT = 'ROOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}


export type User = {
  id: string
  email: string
  role: string
  exp: number
}

export type AuthResponse = {
  user: User
  tokens: {
    accessToken: string
    refreshToken: string
  }
}
// EOF
