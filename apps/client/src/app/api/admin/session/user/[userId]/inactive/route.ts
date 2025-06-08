// @file: client/src/app/api/admin/session/user/[userId]/inactive/route.ts

import { proxyRequest } from '@/lib/api/proxyRequest'
import { NextRequest } from 'next/server'

export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = await params
  return proxyRequest(req, `http://localhost:5000/admin/session/user/${userId}/inactive`, 'DELETE')
}
// EOF
