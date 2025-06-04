// @file: apps/client/src/app/inbox/layout.tsx
import { withRoleGuard } from '@/lib/auth/withRoleGuard'
import { atLeastUser } from '@/lib/auth/rbac.presets'

export default async function InboxLayout({ children }: { children: React.ReactNode }) {
  await withRoleGuard(atLeastUser, '/login')

  return <>{children}</>
}
