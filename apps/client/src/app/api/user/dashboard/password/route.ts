// @file: src/app/api/auth/me/route.ts

import { proxyRequest } from '@/lib/api/proxyRequest'

export async function PATCH(req: Request) {
  return proxyRequest(req, 'http://localhost:5000/user/dashboard/password', 'PATCH')
}
// EOF
