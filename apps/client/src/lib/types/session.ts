// @file: client/src/lib/types/session.ts

export type SessionDto = {
  id: string
  userId: string
  expires: string
  ip: string | null
  deviceInfo: string | null
  createdAt: string
  updatedAt: string
  user: {
    email: string
  } | null
}

export type GroupedSessionByUserDto = {
  userId: string
  email: string
  role: string
  sessionCount: number
  activeSessionCount: number
}

// EOF