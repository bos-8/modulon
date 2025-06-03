// @file: apps/client/src/lib/auth/role.utils.ts
import { UserRole } from './auth.types'

export function castToUserRole(value: unknown): UserRole {
  return Object.values(UserRole).includes(value as UserRole)
    ? (value as UserRole)
    : UserRole.GUEST
}
// EOF
