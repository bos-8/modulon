// @file: apps/client/src/lib/auth/server.auth.ts
import { cookies } from 'next/headers'
import { User } from './auth.types'
import { castToUserRole } from './role.auth'

export async function getMe(): Promise<User | null> {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('access_token')?.value

  if (!accessToken) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/me`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Cookie: `access_token=${accessToken}`,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return {
      ...data,
      role: castToUserRole(data.role),
    } satisfies User
  } catch {
    return null
  }
}
// EOF
