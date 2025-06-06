// @file: server/src/modules/session/session.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { Prisma } from '@prisma/client'
import { GetUserSessionsQueryDto, GetGroupedSessionsQueryDto } from './session.dto'

@Injectable()
export class SessionService {
  constructor(private prisma: PrismaService) { }

  async getUserSessions(
    { page = 1, limit = 20, search, sort }: GetUserSessionsQueryDto,
    userId: string
  ) {
    const safePage = Math.max(page, 1)
    const safeLimit = Math.min(limit, 100)
    const skip = (safePage - 1) * safeLimit

    const [sortField, sortDirection] = (sort || 'createdAt:desc').split(':')
    const validFields = ['ip', 'deviceInfo', 'createdAt', 'expires']
    const orderBy: Prisma.SessionOrderByWithRelationInput = {
      [validFields.includes(sortField) ? sortField : 'createdAt']:
        sortDirection === 'asc' ? 'asc' : 'desc',
    }

    console.log({ page, limit, search, sort, userId })

    const where: Prisma.SessionWhereInput = {
      userId,
      ...(search && {
        OR: [
          { ip: { contains: search } },
          { deviceInfo: { contains: search } },
        ],
      }),
    }

    const now = new Date()

    const [data, total] = await Promise.all([
      this.prisma.session.findMany({
        skip,
        take: safeLimit,
        where,
        orderBy,
        select: {
          id: true,
          userId: true,
          expires: true,
          ip: true,
          deviceInfo: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              email: true,
            },
          },
        },
      }),
      this.prisma.session.count({ where }),
    ])

    return {
      data: data.map((s) => ({
        ...s,
        isActive: s.expires > now,
      })),
      total,
      page: safePage,
      limit: safeLimit,
    }
  }

  async getGroupedSessions({
    page = 1,
    limit = 25,
    search,
    sort,
  }: GetGroupedSessionsQueryDto) {
    const safePage = Math.max(1, page)
    const safeLimit = Math.min(100, limit)
    const skip = (safePage - 1) * safeLimit

    const where: Prisma.UserWhereInput = {
      ...(search && {
        email: { contains: search },
      }),
      sessions: {
        some: {},
      },
    }
    const [sortField, sortDirectionRaw] = (sort || 'email:asc').split(':')
    const direction = sortDirectionRaw === 'desc' ? 'desc' : 'asc'

    const validField = ['email'].includes(sortField) ? sortField : 'email'

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: safeLimit,
        orderBy: {
          [validField]: direction,
        },
        select: {
          id: true,
          email: true,
          role: true,
          sessions: {
            select: { expires: true },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ])

    const now = new Date()

    let data = users.map(user => {
      const sessionCount = user.sessions.length
      const activeSessionCount = user.sessions.filter(s => s.expires > now).length
      return {
        userId: user.id,
        email: user.email,
        role: user.role,
        sessionCount,
        activeSessionCount,
      }
    })

    // sortowanie po virtualnych kolumnach
    if (sortField === 'sessionCount') {
      data = data.sort((a, b) =>
        direction === 'asc' ? a.sessionCount - b.sessionCount : b.sessionCount - a.sessionCount
      )
    } else if (sortField === 'activeSessionCount') {
      data = data.sort((a, b) =>
        direction === 'asc' ? a.activeSessionCount - b.activeSessionCount : b.activeSessionCount - a.activeSessionCount
      )
    }

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
