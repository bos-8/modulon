// @file: server/src/modules/auth/auth.service.ts

import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
  BadRequestException
} from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { ConfigService } from '@nestjs/config'
import { RegisterDto, LoginDto } from './auth.dto'
import * as argon2 from 'argon2'
import { JwtService } from '@nestjs/jwt'
import { Response, Request } from 'express'
import { AuthResponse } from '@/types/auth.response'
import { v4 as uuid } from 'uuid'
import { Logger } from '@nestjs/common'

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
  ) { }

  async register(dto: RegisterDto): Promise<{ message: string }> {
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

    await this.sendEmailVerificationCode(user.email)

    return { message: `Wysłano kod na ${dto.email}` }
  }


  async login(dto: LoginDto, req: Request): Promise<AuthResponse> {
    console.log('[LOGIN]', dto)

    const user = await this.prisma.user.findFirst({
      where: {
        email: dto.email,
        isEmailConfirmed: true,
        NOT: { emailVerified: null },
      },
    })

    if (!user) {
      throw new UnauthorizedException('Invalid credentials or email not verified')
    }

    const isMatch = await argon2.verify(user.password, dto.password)
    if (!isMatch) {
      throw new UnauthorizedException('Invalid credentials')
    }
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    })

    return this.generateTokensAndSession(user.id, user.email, user.role, req)
  }



  private async generateTokensAndSession(
    userId: string,
    email: string,
    role: string,
    req: Request,
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

    const ip = req.ip || req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const userAgent = req.headers['user-agent'] || 'unknown'

    await this.prisma.session.create({
      data: {
        id: sessionId,
        sessionToken: refreshToken,
        userId,
        expires: new Date(Date.now() + this.config.get('auth.refreshToken.expiresInMs')),
        ip: typeof ip === 'string' ? ip : Array.isArray(ip) ? ip[0] : 'unknown',
        deviceInfo: userAgent,
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
    const cookieOptions = {
      httpOnly: true,
      secure: true,
      sameSite: 'lax' as const,
      path: '/',
    }

    res.clearCookie('access_token', cookieOptions)
    res.clearCookie('refresh_token', cookieOptions)
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

  async sendEmailVerificationCode(email: string): Promise<void> {
    const user = await this.prisma.user.findUnique({ where: { email } })
    if (!user) throw new NotFoundException('User not found')

    const token = uuid()
    const expires = new Date(Date.now() + this.config.get('auth.email_verification_ttl.miliSeconds'))

    await this.prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        type: 'EMAIL_CONFIRMATION',
        expires,
      },
    })

    Logger.debug(`${email} >>> ${this.config.get('auth.clientUrl')}/verify-email-link?token=${token}`, 'EMAIL CODE')
    // TODO: Send email with code via email service
  }

  async verifyEmailToken(token: string): Promise<void> {
    const tokenEntry = await this.prisma.verificationToken.findFirst({
      where: {
        token,
        type: 'EMAIL_CONFIRMATION',
        expires: { gte: new Date() },
      },
      include: { user: true },
    })

    if (!tokenEntry) throw new BadRequestException('Invalid or expired token')

    await this.prisma.user.update({
      where: { id: tokenEntry.userId },
      data: {
        isEmailConfirmed: true,
        emailVerified: new Date(),
      },
    })

    await this.prisma.verificationToken.delete({
      where: { id: tokenEntry.id },
    })
  }

}
// EOF
