// @file: apps/client/middleware.ts
import { NextRequest } from 'next/server'
import createMiddleware from 'next-intl/middleware'
import { routing } from './i18n/routing'

/**
 * Middleware odpowiada wyłącznie za obsługę i18n.
 * Wszystkie zabezpieczenia dostępowe odbywają się SSR w layoutach.
 */
export default function middleware(req: NextRequest) {
  const handleI18nRouting = createMiddleware(routing)
  return handleI18nRouting(req)
}

// Zakres działania middleware (wyklucza pliki statyczne, API itd.)
export const config = {
  matcher: '/((?!api|trpc|_next|_vercel|.*\\..*).*)',
}
// EOF
