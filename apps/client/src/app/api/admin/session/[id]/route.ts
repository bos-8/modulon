// @file: client/src/app/api/admin/session/[id]/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const url = new URL(req.url)
  const query = await url.search
  const { id } = await params
  return proxyRequest(req, `http://localhost:5000/admin/session/${id}${query}`, 'GET')
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const { id } = await params
  return proxyRequest(req, `http://localhost:5000/admin/session/${id}`, 'DELETE')
}
// EOF
