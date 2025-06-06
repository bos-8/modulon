// @file: server/src/modules/session/session.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { Prisma } from '@prisma/client'
import { GetSessionsQueryDto } from './session.dto'

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) { }

  async getSessions({
    page = 1,
    limit = 20,
    search,
  }: GetSessionsQueryDto) {
    const safePage = Math.max(page, 1)
    const safeLimit = Math.min(limit, 100)
    const skip = (safePage - 1) * safeLimit

    const where: Prisma.SessionWhereInput = search
      ? {
        OR: [
          { ip: { contains: search } },
          { deviceInfo: { contains: search } },
          { user: { email: { contains: search } } },
        ],
      }
      : {}

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        skip,
        take: safeLimit,
        where,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          userId: true,
          expires: true,
          ip: true,
          deviceInfo: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: { email: true },
          },
        },
      }),
      this.prisma.session.count({ where }),
    ])

    return {
      data,
      total,
      page: safePage,
      limit: safeLimit,
    }
  }

  async deleteSession(id: string) {
    return this.prisma.session.delete({ where: { id } })
  }

  async deleteSessionsByUser(userId: string) {
    return this.prisma.session.deleteMany({ where: { userId } })
  }
}
// EOF
