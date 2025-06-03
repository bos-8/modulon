// @file: apps/client/src/lib/auth/session.ts
export function scheduleSessionExpiryWarning(exp: number, callback: () => void): NodeJS.Timeout | null {
  const now = Date.now()
  const expiresAt = exp * 1000
  const warningTime = expiresAt - 5 * 60 * 1000 // 5 minut przed wygaśnięciem

  const delay = warningTime - now

  if (delay <= 0) {
    callback()
    return null
  }

  return setTimeout(callback, delay)
}
