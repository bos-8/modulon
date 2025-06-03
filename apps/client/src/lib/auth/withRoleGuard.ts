// @file: apps/client/src/lib/auth/withRoleGuard.ts
import { redirect } from 'next/navigation'
import { getMe } from './server.auth'
import { castToUserRole } from './role.auth'
import { User, UserRole } from './auth.types'

/**
 * Weryfikuje czy użytkownik ma jedną z dozwolonych ról.
 * W przypadku braku dostępu następuje redirect.
 *
 * @param allowedRoles - Lista ról z dostępem
 * @param redirectTo - Domyślnie '/unauthorized', może być też '/login'
 */
export async function withRoleGuard(
  allowedRoles: UserRole[],
  redirectTo: string = '/unauthorized'
): Promise<User> {
  const user = await getMe()
  const role = castToUserRole(user?.role)

  if (!user || !allowedRoles.includes(role)) {
    redirect(redirectTo)
  }

  return user
}
// EOF
