// @file: apps/client/src/lib/auth/rbac.presets.ts
import { UserRole } from './auth.types'

export const atLeastUser: UserRole[] = [
  UserRole.USER,
  UserRole.MODERATOR,
  UserRole.ADMIN,
  UserRole.SYSTEM,
  UserRole.ROOT,
]

export const adminsOnly: UserRole[] = [
  UserRole.ADMIN,
  UserRole.SYSTEM,
  UserRole.ROOT,
]
// EOF