// @file: client/src/app/[locale]/admin/layout.tsx
import { withRoleGuard } from '@/lib/auth/withRoleGuard'
import { adminsOnly } from '@/lib/auth/rbac.presets'

export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  await withRoleGuard(adminsOnly, '/login')

  return <>{children}</>
}
