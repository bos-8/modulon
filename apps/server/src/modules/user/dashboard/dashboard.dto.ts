// @file: server/src/modules/user/dashboard/dashboard.dto.ts
import { IsOptional, IsString, IsEnum, IsDateString, MinLength } from 'class-validator'
import { Gender } from '@prisma/client'

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
  @IsString() @MinLength(8) newPassword: string
}