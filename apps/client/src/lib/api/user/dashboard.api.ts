// @file: client/src/lib/api/user-dashboard.api.ts

import api from '@/lib/api/axios'
import type { UserDashboardData } from '@/lib/types/dashboard'

/**
 * Pobiera dane profilu użytkownika (łącznie z PersonalData)
 */
export async function fetchUserDashboard(): Promise<UserDashboardData> {
  const response = await api.get('/user/dashboard')
  return response.data
}

/**
 * Aktualizuje dane użytkownika (User + PersonalData)
 */
export async function updateUserDashboard(
  formData: Partial<UserDashboardData>
): Promise<{ message: string }> {
  const payload = {
    username: formData.username ?? undefined,
    name: formData.name ?? undefined,
    firstName: formData.personalData?.firstName ?? undefined,
    middleName: formData.personalData?.middleName ?? undefined,
    lastName: formData.personalData?.lastName ?? undefined,
    phoneNumber: formData.personalData?.phoneNumber ?? undefined,
    address: formData.personalData?.address ?? undefined,
    city: formData.personalData?.city ?? undefined,
    zipCode: formData.personalData?.zipCode ?? undefined,
    country: formData.personalData?.country ?? undefined,
    birthDate: formData.personalData?.birthDate?.trim() ?? undefined,
    gender: formData.personalData?.gender ?? undefined,
  }

  console.log('Updating user dashboard with payload:', payload)

  const response = await api.patch('/user/dashboard', payload)
  return response.data
}

export async function changeUserPassword(payload: {
  currentPassword: string
  newPassword: string
}): Promise<void> {
  await api.patch('/user/dashboard/password', payload)
}

// EOF
