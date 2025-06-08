// @file: client/src/app/api/admin/session/user/[userId]/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function DELETE(req: NextRequest, { params }: { params: { userId: string } }) {
  const { userId } = await params
  return proxyRequest(req, `http://localhost:5000/admin/session/user/${userId}`, 'DELETE')
}
// EOF
