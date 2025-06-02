// @file: apps/client/src/lib/auth/auth.api.ts

import api from '@/lib/api/axios'
import { AuthResponse } from './auth.types'

export async function login(payload: { email: string; password: string }): Promise<AuthResponse> {
  const res = await api.post('/auth/login', payload)
  return res.data
}

export async function register(payload: { email: string; password: string }) {
  const res = await api.post('/auth/register', payload)
  return res.data
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function fetchMe(): Promise<AuthResponse['user']> {
  const res = await api.get('/auth/me')
  return res.data
}
// EOF
