// @file: server/src/modules/admin/user/user.dto.ts

import { UserRole } from '@prisma/client'
import { Transform, Type } from 'class-transformer'
import { IsBoolean, IsEmail, IsEnum, ValidateNested, IsNumber, IsOptional, IsString, MinLength, IsBooleanString, IsInt, Matches, Min } from 'class-validator'

export class UserDto {
  id: string
  email: string | null
  username: string | null
  name: string | null
  role: UserRole
  isActive: boolean
  isBlocked: boolean
  twoFactorEnabled: boolean
  failedLoginAttempts: number
  lastLoginAt: Date | null
  createdAt: Date
  isEmailConfirmed: boolean
}

export class PaginatedUsersResponse {
  data: UserDto[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export class PersonalDataDto {
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
  birthDate?: Date
  gender?: string
  canUserEdit: boolean
  createdAt: Date
  updatedAt: Date
}


export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean

  @IsOptional()
  @IsBoolean()
  isEmailConfirmed?: boolean

  @IsOptional()
  @IsNumber()
  failedLoginAttempts?: number

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  emailVerified?: Date
}

export class CreateUserDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  username?: string

  @IsEmail()
  email: string

  @IsString()
  @MinLength(6)
  password: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole
}

export class GetUsersQueryDto {
  // paginacja i sortowanie
  @IsOptional() @Transform(({ value }) => parseInt(value)) page?: number = 1
  @IsOptional() @Transform(({ value }) => parseInt(value)) limit?: number = 25
  @IsOptional() @IsString() sort?: string = 'createdAt:desc'

  // filtr globalny
  @IsOptional() @IsString() search?: string

  // filtry szczegółowe
  @IsOptional() @IsString() email?: string
  @IsOptional() @IsString() username?: string
  @IsOptional() @IsEnum(UserRole) @Transform(({ value }) => (value === '' ? undefined : value)) role?: UserRole
  @IsOptional() @IsBooleanString() @Transform(({ value }) => (value === '' ? undefined : value)) isBlocked?: string
}

export class UpdatePersonalDataDto {
  @IsOptional()
  @IsString()
  firstName?: string

  @IsOptional()
  @IsString()
  middleName?: string

  @IsOptional()
  @IsString()
  lastName?: string

  @IsOptional()
  @Matches(/^$|^[+]?[\d\s\-]+$/, { message: 'Niepoprawny numer telefonu' })
  phoneNumber?: string


  @IsOptional()
  @IsString()
  address?: string

  @IsOptional()
  @IsString()
  city?: string

  @IsOptional()
  @IsString()
  zipCode?: string

  @IsOptional()
  @IsString()
  country?: string

  @IsOptional()
  @Transform(({ value }) => (value ? new Date(value) : undefined))
  birthDate?: Date

  @IsOptional()
  @IsString()
  gender?: string
}

export class UserWithPersonalDataDto {
  user: UserDto
  personalData?: PersonalDataDto
}


export class UpdateUserWithPersonalDataDto {
  @IsOptional()
  @IsString()
  name?: string

  @IsOptional()
  @IsString()
  username?: string

  @IsOptional()
  @IsString()
  password?: string

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole

  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsBoolean()
  isBlocked?: boolean

  @IsOptional()
  @IsBoolean()
  isEmailConfirmed?: boolean

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePersonalDataDto)
  personalData?: UpdatePersonalDataDto
}

// EOF
