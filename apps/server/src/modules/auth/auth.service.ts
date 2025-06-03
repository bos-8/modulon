// @file: server/src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
} from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { ConfigService } from '@nestjs/config'
// import { AuthConfig } from '@/types/auth.config.type'
import { RegisterDto, LoginDto } from './auth.dto'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { Response, Request } from 'express'
import { AuthResponse } from '@/types/auth.response'
import { v4 as uuid } from 'uuid'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const userExists = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (userExists) throw new ConflictException('User already exists')

    const hashed = await argon2.hash(dto.password)

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashed,
        role: 'USER',
      },
    })

    console.log('[REGISTER]', user) // <--- dodaj to

    return this.generateTokensAndSession(user.id, user.email, user.role)
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    console.log('[LOGIN]', dto)

    const user = await this.prisma.user.findUnique({ where: { email: dto.email } })
    if (!user) throw new UnauthorizedException('Invalid credentials')

    const isMatch = await argon2.verify(user.password, dto.password)
    if (!isMatch) throw new UnauthorizedException('Invalid credentials')

    return this.generateTokensAndSession(user.id, user.email, user.role)
  }

  private async generateTokensAndSession(
    userId: string,
    email: string,
    role: string,
  ): Promise<AuthResponse> {
    const sessionId = uuid()

    const accessToken = await this.jwt.signAsync(
      { sub: userId, email, role, sid: sessionId },
      {
        secret: this.config.get('auth.accessToken.secret'),
        expiresIn: this.config.get('auth.accessToken.expiresInSec'),
      },
    )

    const refreshToken = await this.jwt.signAsync(
      { sub: userId, sid: sessionId },
      {
        secret: this.config.get('auth.refreshToken.secret'),
        expiresIn: this.config.get('auth.refreshToken.expiresInSec'),

      },
    )

    await this.prisma.session.create({
      data: {
        id: sessionId,
        sessionToken: refreshToken,
        userId,
        expires: new Date(Date.now() + this.config.get('auth.refreshToken.expiresInMs')),
        // opcjonalnie:
        // ip: req.ip,
        // deviceInfo: getDeviceInfo(req),
      },
    })

    return {
      user: { id: userId, email, role },
      tokens: { accessToken, refreshToken },
    }
  }

  setAuthCookies(res: Response, tokens: { accessToken: string; refreshToken: string }) {
    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      maxAge: this.config.get('auth.accessToken.expiresInMs'),
      sameSite: 'lax',
      secure: this.config.get('auth.isProd'),
    })
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      maxAge: this.config.get('auth.refreshToken.expiresInMs'),
      sameSite: 'lax',
      secure: this.config.get('auth.isProd'),
    })
  }

  async clearAuthCookies(res: Response) {
    res.clearCookie('access_token')
    res.clearCookie('refresh_token')
  }

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.cookies?.refresh_token

    if (refreshToken) {
      try {
        const payload = this.jwt.decode(refreshToken) as { sid: string }
        if (payload?.sid) {
          await this.prisma.session.delete({
            where: { id: payload.sid },
          })
        }
      } catch (err) {
        // log optionally or ignore
      }
    }

    this.clearAuthCookies(res)
  }


  async refreshSession(req: Request): Promise<AuthResponse> {
    const refreshToken = req.cookies?.refresh_token
    if (!refreshToken) throw new UnauthorizedException('No refresh token')

    // weryfikacja JWT
    let payload: any
    try {
      payload = await this.jwt.verifyAsync(refreshToken, {
        secret: this.config.get('auth.refreshToken.secret'),
      })
    } catch {
      throw new UnauthorizedException('Invalid or expired token')
    }

    // pobranie sesji z DB
    const session = await this.prisma.session.findUnique({
      where: { id: payload.sid },
      include: { user: true },
    })

    if (!session || session.expires.getTime() < Date.now())
      throw new UnauthorizedException('Session expired or not found')

    // opcjonalne odświeżenie expires (strategia sliding window)
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        expires: new Date(Date.now() + this.config.get('auth.refreshToken.expiresInMs')),
      },
    })

    // generuj nowe tokeny
    const accessToken = await this.jwt.signAsync(
      {
        sub: session.user.id,
        email: session.user.email,
        role: session.user.role,
        sid: session.id,
      },
      {
        secret: this.config.get('auth.accessToken.secret'),
        expiresIn: this.config.get('auth.accessToken.expiresInSec'),
      },
    )

    const newRefreshToken = await this.jwt.signAsync(
      { sub: session.user.id, sid: session.id },
      {
        secret: this.config.get('auth.refreshToken.secret'),
        expiresIn: this.config.get('auth.refreshToken.expiresInSec'),
      },
    )

    // aktualizacja sessionToken
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        sessionToken: newRefreshToken,
      },
    })

    return {
      user: {
        id: session.user.id,
        email: session.user.email,
        role: session.user.role,
      },
      tokens: {
        accessToken,
        refreshToken: newRefreshToken,
      },
    }
  }
}
// EOF
