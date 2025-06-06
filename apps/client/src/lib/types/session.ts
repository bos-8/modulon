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

// EOF