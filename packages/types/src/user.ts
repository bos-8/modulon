// @file: packages/types/src/user.ts

export enum UserRole {
  ROOT = 'ROOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMINISTRATOR',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST'
}

export interface SessionResponse {
  id: string
  email: string
  role: UserRole
  exp: number // expiry timestamp (z tokena)
  iat: number // issued at
}
