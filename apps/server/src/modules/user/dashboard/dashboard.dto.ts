// @file: server/src/modules/user/dashboard/dashboard.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString, MinLength } from 'class-validator'
import { Gender, UserRole } from '@prisma/client'

export class DashboardDto {
  id: string
  email: string
  username: string | null
  name: string | null
  role: UserRole
  image: string | null
  lastLoginAt: Date | null
  createdAt: Date

  personalData: {
    firstName: string | null
    middleName: string | null
    lastName: string | null
    phoneNumber: string | null
    address: string | null
    city: string | null
    zipCode: string | null
    country: string | null
    birthDate: Date | null
    gender: Gender | null
  }
}

export class UpdateUserDashboardDto {
  @IsOptional() @IsString() username?: string
  @IsOptional() @IsString() name?: string

  @IsOptional() @IsString() firstName?: string
  @IsOptional() @IsString() middleName?: string
  @IsOptional() @IsString() lastName?: string
  @IsOptional() @IsString() phoneNumber?: string
  @IsOptional() @IsString() address?: string
  @IsOptional() @IsString() city?: string
  @IsOptional() @IsString() zipCode?: string
  @IsOptional() @IsString() country?: string
  @IsOptional() @IsDateString() birthDate?: string
  @IsOptional() @IsEnum(Gender) gender?: Gender
}

export class ChangePasswordDto {
  @IsString() currentPassword: string
  @IsString() @MinLength(6) newPassword: string
}
// EOF
