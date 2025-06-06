// @file: server/src/modules/admin/user/user.dto.ts

import { UserRole } from '@prisma/client'
import { Transform } from 'class-transformer'
import { IsBoolean, IsEmail, IsEnum, IsNumber, IsOptional, IsString, MinLength, IsBooleanString, IsInt, Matches, Min } from 'class-validator'

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
}

export class PaginatedUsersResponse {
  data: UserDto[]
  total: number
  page: number
  limit: number
  totalPages: number
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
// EOF
