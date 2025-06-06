// @file: client/src/lib/api/admin/session.api.ts

import axios from '@/lib/api/axios'

// export const getSessions = async (params?: { search?: string }) => {
//   const query = new URLSearchParams()
//   if (params?.search) query.append('search', params.search)
//   const res = await axios.get(`/admin/session?${query.toString()}`)
//   return res.data
// }

type GetSessionsParams = {
  search?: string
  sort?: string // np. "createdAt:desc"
  page?: number
  limit?: number
}

export const getSessions = async (params?: GetSessionsParams) => {
  const query = new URLSearchParams()
  if (params?.search) query.append('search', params.search)
  if (params?.sort) query.append('sort', params.sort)
  if (params?.page) query.append('page', params.page.toString())
  if (params?.limit) query.append('limit', params.limit.toString())

  const res = await axios.get(`/admin/session?${query.toString()}`)
  return res.data
}



export const deleteSession = async (id: string) => {
  return axios.delete(`/admin/session/${id}`)
}

export const deleteUserSessions = async (userId: string) => {
  return axios.delete(`/admin/session/user/${userId}`)
}
// EOF
