// @file: apps/client/src/lib/auth/withoutRole.ts
import { getMe } from './server.auth'
import { redirect } from 'next/navigation'

/**
 * Umożliwia dostęp tylko niezalogowanym użytkownikom (null lub GUEST).
 * Pozostali są przekierowywani (domyślnie na /dashboard).
 */
export async function withoutRole(redirectTo = '/dashboard') {
  const user = await getMe()

  const isGuestOrNotLoggedIn =
    !user || !user.role

  if (!isGuestOrNotLoggedIn) {
    redirect(redirectTo)
  }

  return null
}
// EOF