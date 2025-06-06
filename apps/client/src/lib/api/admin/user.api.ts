// @file: client/src/lib/api/admin/user.ts
import api from '@/lib/api/axios'
import { UpdateUserDto, CreateUserDto, UserDto } from '@/lib/types/user'

export async function fetchAllUsers(): Promise<UserDto[]> {
  const res = await api.get('/admin/users')
  return res.data
}

export async function fetchUserById(id: string): Promise<UserDto> {
  const res = await api.get(`/admin/users/${id}`)
  return res.data
}

export async function createUser(data: CreateUserDto): Promise<any> {
  const res = await api.post('/admin/users', data)
  return res.data
}

export async function updateUser(id: string, data: UpdateUserDto): Promise<string> {
  const res = await api.patch(`/admin/users/${id}`, data)
  return res.data
}

export async function deleteUser(id: string): Promise<void> {
  const res = await api.delete(`/admin/users/${id}`)
  return res.data
}

export type FetchUsersParams = {
  page?: number
  limit?: number
  sort?: string
}

export type PaginatedUsersResponse = {
  data: UserDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export async function fetchUsersPaginated(params: FetchUsersParams): Promise<PaginatedUsersResponse> {
  const res = await api.get('/admin/users', { params })
  console.log('[fetchUsersPaginated]', res.data)
  return res.data
}
// EOF