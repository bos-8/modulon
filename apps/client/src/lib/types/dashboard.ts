// @file: client/src/lib/types/user-dashboard.ts

import { Gender, UserRole } from './user'

export interface UserDashboardData {
  id: string
  email: string
  username: string | null
  name: string | null
  role: UserRole
  image: string | null
  lastLoginAt: string | null
  createdAt: string
  personalData: {
    firstName: string | null
    middleName: string | null
    lastName: string | null
    phoneNumber: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    country: string | null
    birthDate: string | null
    gender: Gender | null
  }
}
// EOF