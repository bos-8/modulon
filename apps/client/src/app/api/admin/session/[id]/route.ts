// @file: client/src/app/api/admin/session/[id]/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params;
  const url = `http://localhost:5000/admin/session/${id}`
  return proxyRequest(req, url, 'DELETE')
}
// EOF
