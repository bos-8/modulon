// @file: server/src/modules/auth/dto/auth.dto.ts

import { IsEmail, IsNotEmpty, MinLength, IsString, Length, IsUUID } from 'class-validator'

export class LoginDto {
  @IsEmail()
  email: string

  @IsNotEmpty()
  password: string
}

export class RegisterDto {
  @IsEmail()
  email: string

  @MinLength(6)
  password: string
}

export class SendEmailVerificationDto {
  @IsEmail()
  email: string
}

export class VerifyEmailTokenDto {
  @IsUUID()
  token: string
}


// EOF
