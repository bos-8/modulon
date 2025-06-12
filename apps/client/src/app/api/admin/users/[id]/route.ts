// @file: client/src/app/api/admin/user/[id]/route.ts

import { NextRequest } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

// @file: client/src/app/api/admin/user/[id]/route.ts
export async function GET(req: NextRequest, context: { params: { id: string } }) {
  return proxyRequest(req, `http://localhost:5000/admin/user/${context.params.id}`, 'GET')
}

export async function PATCH(req: NextRequest, context: { params: { id: string } }) {
  const { id } = await context.params;
  return proxyRequest(req, `http://localhost:5000/admin/user/${id}`, 'PATCH')
}

export async function DELETE(req: NextRequest, context: { params: { id: string } }) {
  return proxyRequest(req, `http://localhost:5000/admin/user/${context.params.id}`, 'DELETE')
}
// EOF