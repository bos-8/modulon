// @file: client/src/app/api/auth/verify-email-code/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'http://localhost:5000/auth/verify-email-code', 'POST')
}
// EOF
