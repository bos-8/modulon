// @file: client/src/lib/api/admin/session.api.ts
// @description: API wrapper dla operacji na sesjach użytkowników (GET, DELETE – lista, szczegóły, agregacja)

import axios from '@/lib/api/axios'
import type { GroupedSessionByUserDto, SessionDto } from '@/lib/types/session'

type PaginationParams = {
  page?: number
  limit?: number
  search?: string
  sort?: string
}

type PaginationResult<T> = {
  data: T[]
  total: number
  page: number
  limit: number
}

// ✅ Lista zagregowanych sesji użytkowników
export const getGroupedSessions = async (params?: PaginationParams) => {
  const res = await axios.get<PaginationResult<GroupedSessionByUserDto>>(
    '/admin/session/grouped',
    { params: params && Object.keys(params).length ? params : undefined }
  )

  return res.data
}

// ✅ Lista sesji (wszystkich lub tylko danego użytkownika)
export const getSessions = async (
  params: PaginationParams & { userId?: string }
) => {
  const { userId, ...rest } = params
  const endpoint = userId?.trim()
    ? `/admin/session/${userId}`
    : `/admin/session`

  const res = await axios.get<PaginationResult<SessionDto>>(endpoint, {
    params: Object.keys(rest).length ? rest : undefined,
  })

  return res.data
}

// ✅ Usuń pojedynczą sesję
export const deleteSession = async (id: string) => {
  await axios.delete(`/admin/session/${id}`)
}

// ✅ Usuń wszystkie sesje użytkownika
export const deleteUserSessions = async (userId: string) => {
  await axios.delete(`/admin/session/user/${userId}`)
}

// ✅ Usuń nieaktywne sesje użytkownika
export const deleteUserInactiveSessions = async (userId: string) => {
  await axios.delete(`/admin/session/user/${userId}/inactive`)
}

// EOF
