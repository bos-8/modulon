// @file: server/src/config.ts
import { AuthConfig } from './types/auth.config.type.js';
import { registerAs } from '@nestjs/config';

export default registerAs<AuthConfig>('auth', () => ({
  accessToken: {
    secret: process.env.JWT_ACCESS_SECRET!,
    expiresInMs: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '15', 10) * 60_000,
    expiresInSec: parseInt(process.env.JWT_ACCESS_EXPIRES_IN || '15', 10) * 60,
  },
  refreshToken: {
    secret: process.env.JWT_REFRESH_SECRET!,
    expiresInMs: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '360', 10) * 60_000,
    expiresInSec: parseInt(process.env.JWT_REFRESH_EXPIRES_IN || '360', 10) * 60,
  },
  rateLimit: {
    ttl: parseInt(process.env.RATE_LIMIT_TTL || '60', 10) * 1000,
    limit: parseInt(process.env.RATE_LIMIT_MAX || '10', 10),
    blockDuration: parseInt(process.env.RATE_LIMIT_BLOCK_DURATION || '30', 10) * 1000,
  },
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: process.env.NODE_ENV === 'production',
}))
// EOF