// @file: client/src/app/api/admin/session/inactive/all/route.ts

import { proxyRequest } from '@/lib/api/proxyRequest'
import { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest) {
  return proxyRequest(req, 'http://localhost:5000/admin/session/inactive/all', 'DELETE')
}
// EOF
