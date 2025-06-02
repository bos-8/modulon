// @file: src/app/api/auth/login/route.ts

import { proxyRequest } from '@/lib/api/proxyRequest'

export async function POST(req: Request) {
  return proxyRequest(req, 'http://localhost:5000/auth/login', 'POST')
}
// EOF
