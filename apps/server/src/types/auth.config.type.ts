// @file: server/src/config/types/auth-config.type.ts
export type AuthConfig = {
  accessToken: {
    secret: string
    expiresInMs: number
    expiresInSec: number
  }
  refreshToken: {
    secret: string
    expiresInMs: number
    expiresInSec: number
  }
  rateLimit: {
    ttl: number
    limit: number
  }
  nodeEnv: string,
  isProd: boolean,
  email_verification_ttl: {
    minutes: number
    seconds: number
    miliSeconds: number
  },
  clientUrl: string
}
// EOF