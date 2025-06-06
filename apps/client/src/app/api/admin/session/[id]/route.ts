// @file: client/src/app/api/admin/session/[id]/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url)
  const query = url.search
  return proxyRequest(req, `http://localhost:5000/admin/session/${params.id}${query}`, 'GET')
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  return proxyRequest(req, `http://localhost:5000/admin/session/${params.id}`, 'DELETE')
}
// EOF
