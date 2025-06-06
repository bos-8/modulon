// @file: client/src/types/user.ts
export enum UserRole {
  ROOT = 'ROOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}

export type UserDto = {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
  isBlocked: boolean
  createdAt: string
  lastLoginAt: string | null
  isEmailConfirmed?: boolean
  failedLoginAttempts: number
}

export type UpdateUserDto = {
  name?: string
  username?: string
  password?: string
  role?: UserRole
  isActive?: boolean
  isBlocked?: boolean
  isEmailConfirmed?: boolean
}

export type CreateUserDto = {
  email: string
  username?: string
  name?: string
  password: string
  role?: UserRole | UserRole.USER
}
// EFO