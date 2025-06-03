// @file: apps/client/src/app/dashboard/layout.tsx
import { withRoleGuard } from '@/lib/auth/withRoleGuard'
import { UserRole } from '@/lib/auth/auth.types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await withRoleGuard(
    [UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.SYSTEM, UserRole.ROOT],
    '/login'
  )

  return <>{children}</>
}
// EOF