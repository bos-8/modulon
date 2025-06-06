// @file: client/src/app/api/admin/session/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function GET(req: NextRequest) {
  const search = req.nextUrl.search // ?search=xyz
  const url = `http://localhost:5000/admin/session${search}`
  return proxyRequest(req, url, 'GET')
}
// EOF
