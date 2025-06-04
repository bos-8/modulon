// @file: server/src/modules/auth/auth.controller.ts

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common'
import { AuthService } from './auth.service'
import { LoginDto, RegisterDto } from './auth.dto'
import { Request, Response } from 'express'
import { AuthResponse, MeResponse } from '@/types/auth.response'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { Roles } from '@/decorators/roles.decorator'
import { RolesGuard } from '@/guards/roles.guard'
import { UserRole } from '@prisma/client'
import { Throttle } from '@nestjs/throttler'

interface JwtRequestUser {
  id: string
  email: string
  role: UserRole
  exp: number
}

// @UseGuards(JwtAuthGuard, RolesGuard)
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    console.log('Registering user:', dto)
    const result = await this.authService.register(dto)
    this.authService.setAuthCookies(res, result.tokens)
    return result
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.login(dto)
    this.authService.setAuthCookies(res, result.tokens)
    return result
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  // @Throttle({ default: { limit: 100, ttl: 10000, blockDuration: 30000 } })
  async logout(@Req() req: Request, @Res({ passthrough: true }) res: Response): Promise<void> {
    await this.authService.logout(req, res)
  }

  @Get('me')
  @HttpCode(HttpStatus.OK)
  // @Throttle({ default: { limit: 200, ttl: 10000, blockDuration: 30000 } })
  @UseGuards(JwtAuthGuard)
  async me(@Req() req: Request): Promise<MeResponse> {
    const user = req.user as JwtRequestUser
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      exp: user.exp,
    }
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponse> {
    const result = await this.authService.refreshSession(req)
    this.authService.setAuthCookies(res, result.tokens)
    return result
  }
}
// EOF
