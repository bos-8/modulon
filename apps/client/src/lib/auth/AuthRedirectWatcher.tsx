// @file: apps/client/src/components/auth/AuthRedirectWatcher.tsx

'use client'

import { useIsAuthenticated } from '@/lib/auth/auth.context'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect } from 'react'

const protectedRoutes = ['/dashboard', '/inbox', '/admin', '/system']

export const AuthRedirectWatcher = () => {
  const isAuthenticated = useIsAuthenticated()
  const pathname = usePathname()
  const router = useRouter()

  useEffect(() => {
    const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))

    if (!isAuthenticated && isProtected) {
      router.replace('/login')
    }
  }, [isAuthenticated, pathname])

  return null
}
// EOF