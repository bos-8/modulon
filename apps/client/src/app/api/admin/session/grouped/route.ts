// @file: client/src/app/api/admin/session/grouped/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function GET(req: NextRequest) {
  return proxyRequest(req, `http://localhost:5000/admin/session${req.nextUrl.search}`, 'GET')
}
// EOF
