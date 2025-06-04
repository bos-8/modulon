// @file: apps/client/src/app/login/layout.tsx
import { withoutRole } from '@/lib/auth/withoutRole'

export default async function LoginLayout({ children }: { children: React.ReactNode }) {
  await withoutRole('/dashboard')
  return <>{children}</>
}
