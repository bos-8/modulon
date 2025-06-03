// @file: apps/client/src/app/api/auth/refresh/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { proxyRequest } from '@/lib/api/proxyRequest'

export async function POST(req: NextRequest) {
  return proxyRequest(req, 'http://localhost:5000/auth/refresh', 'POST')
}
