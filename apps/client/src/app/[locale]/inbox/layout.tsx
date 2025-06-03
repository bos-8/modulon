// @file: apps/client/src/app/dashboard/layout.tsx
import { withRoleGuard } from '@/lib/auth/withRoleGuard'
import { atLeastUser } from '@/lib/auth/rbac.presets'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  await withRoleGuard(atLeastUser, '/login')

  return <>{children}</>
}
