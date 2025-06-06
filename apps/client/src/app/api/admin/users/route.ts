// @file: client/src/app/api/admin/users/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

// export async function GET(req: NextRequest) {
//   return proxyRequest(req, 'http://localhost:5000/admin/users', 'GET')
// }

export async function GET(req: NextRequest) {
  const targetUrl = `http://localhost:5000/admin/users${req.nextUrl.search}`
  return proxyRequest(req, targetUrl, 'GET')
}

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'http://localhost:5000/admin/users', 'POST')
}
// EOF
