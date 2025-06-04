// @file: apps/client/src/app/register/layout.tsx
import { withoutRole } from '@/lib/auth/withoutRole'

export default async function RegisterLayout({ children }: { children: React.ReactNode }) {
  await withoutRole('/dashboard')
  return <>{children}</>
}
// EOF