// @file: client/src/lib/api/user/dashboard.api.ts
import { api } from '@/lib/api/axios'
import type { PublicUserAccountDto } from '@modulon/types'

export async function getUserDashboard(): Promise<PublicUserAccountDto> {
  const res = await api.get<PublicUserAccountDto>('/user/dashboard')
  console.log('getUserDashboard', res)
  return res.data
}