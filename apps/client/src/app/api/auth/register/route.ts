// @file: src/app/api/auth/register/route.ts

import { proxyRequest } from '@/lib/api/proxyRequest'

export async function POST(req: Request) {
  return proxyRequest(req, 'http://localhost:5000/auth/register', 'POST')
}
// EOF
