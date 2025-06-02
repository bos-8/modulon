// @file: server/src/modules/auth/types/auth-response.type.ts

export type TokenPair = {
  accessToken: string
  refreshToken: string
}

export type AuthResponse = {
  user: {
    id: string
    email: string
    role: string
  }
  tokens: TokenPair
}

export type MeResponse = {
  id: string
  email: string
  role: string
}
// EOF
