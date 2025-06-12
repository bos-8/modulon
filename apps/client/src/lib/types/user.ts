// @file: client/src/types/user.ts

export enum UserRole {
  ROOT = 'ROOT',
  SYSTEM = 'SYSTEM',
  ADMIN = 'ADMIN',
  MODERATOR = 'MODERATOR',
  USER = 'USER',
  GUEST = 'GUEST',
}

export enum Gender {
  MALE = 'MALE',
  FEMALE = 'FEMALE',
  OTHER = 'OTHER',
}

export type UserDto = {
  id: string
  email: string
  username: string
  name: string
  role: UserRole
  isActive: boolean
  isBlocked: boolean
  createdAt: string
  lastLoginAt: string | null
  isEmailConfirmed?: boolean
  failedLoginAttempts: number
}

export type UpdateUserDto = {
  name?: string
  username?: string
  password?: string
  role?: UserRole
  isActive?: boolean
  isBlocked?: boolean
  isEmailConfirmed?: boolean
}

export type CreateUserDto = {
  email: string
  username?: string
  name?: string
  password: string
  role?: UserRole | UserRole.USER
}

// === PersonalData ===

export type PersonalDataDto = {
  id: string
  userId: string
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  birthDate?: string
  gender?: Gender
  canUserEdit: boolean
  createdAt: string
  updatedAt: string
}

export type UpdatePersonalDataDto = {
  firstName?: string
  middleName?: string
  lastName?: string
  phoneNumber?: string
  address?: string
  city?: string
  zipCode?: string
  country?: string
  birthDate?: string
  gender?: Gender
}

// === Widok zbiorczy (używany przy edycji konta) ===

export type UserWithPersonalDataDto = {
  user: UserDto
  personalData?: PersonalDataDto | null
}
// EOF
