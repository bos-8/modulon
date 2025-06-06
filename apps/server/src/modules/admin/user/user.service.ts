// @file: server/src/modules/admin/user/user.service.ts

import { Injectable } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { UserDto, UpdateUserDto, CreateUserDto, GetUsersQueryDto } from './user.dto'
import {
  UserNotFoundException,
  SelfModificationForbiddenException,
  UserInvalidRoleChangeException,
} from './user.exception'
import { JwtRequestUser } from '@/interfaces/jwt.request.user.interface'
import { UserRole } from '@prisma/client'
import * as argon2 from 'argon2'

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) { }

  // async getAllUsers(): Promise<UserDto[]> {
  //   const users = await this.prisma.user.findMany({
  //     orderBy: { createdAt: 'desc' },
  //   })
  //   return users.map(this.toDto)
  // }

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new UserNotFoundException()
    return this.toDto(user)
  }

  async getUsers(query: GetUsersQueryDto) {
    const {
      page = 1,
      limit = 25,
      sort = 'createdAt:desc',
      search,
      email,
      username,
      role,
      isBlocked,
    } = query

    const [field, direction] = sort.split(':')
    const validSortFields = ['email', 'username', 'name', 'role', 'createdAt', 'lastLoginAt']
    const safeField = validSortFields.includes(field) ? field : 'createdAt'
    const safeDirection = direction === 'asc' ? 'asc' : 'desc'

    const skip = (page - 1) * limit

    // dynamiczne warunki Prisma
    const where: any = {
      ...(search && {
        OR: [
          { email: { contains: search } },
          { username: { contains: search } },
          { name: { contains: search } },
        ],
      }),
      ...(email && { email: { contains: email } }),
      ...(username && { username: { contains: username } }),
      ...(role && { role }),
      ...(typeof isBlocked === 'string' && {
        isBlocked: isBlocked === 'true',
      }),
    }

    // console.log('Querying users with conditions:', where);
    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        skip,
        take: limit,
        orderBy: { [safeField]: safeDirection },
        where,
      }),
      this.prisma.user.count({ where }),
    ])

    return {
      data: users.map(this.toDto),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    }
  }

  // async getUsers(query: GetUsersQueryDto) {
  //   const { page = 1, limit = 25, sort = 'createdAt:desc' } = query
  //   const [field, direction] = sort.split(':')

  //   const validSortFields = ['email', 'username', 'name', 'role', 'createdAt', 'lastLoginAt']
  //   const safeField = validSortFields.includes(field) ? field : 'createdAt'
  //   const safeDirection = direction === 'asc' ? 'asc' : 'desc'

  //   const skip = (page - 1) * limit

  //   const [users, total] = await this.prisma.$transaction([
  //     this.prisma.user.findMany({
  //       skip,
  //       take: limit,
  //       orderBy: {
  //         [safeField]: safeDirection,
  //       },
  //     }),
  //     this.prisma.user.count(),
  //   ])

  //   return {
  //     data: users.map(this.toDto),
  //     total,
  //     page,
  //     limit,
  //     totalPages: Math.ceil(total / limit),
  //   }
  // }


  async updateUser(
    id: string,
    dto: UpdateUserDto,
    current: JwtRequestUser,
  ): Promise<{ message: string }> {
    if (id === current.id) {
      throw new SelfModificationForbiddenException('role-change')
    }

    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new UserNotFoundException()

    if (
      dto.role &&
      this.isRoleHigher(dto.role, current.role)
    ) {
      throw new UserInvalidRoleChangeException()
    }

    // Mapuj wartości tylko jeśli są niepuste ('' ignorujemy)
    const updatedData: UpdateUserDto = {
      name: dto.name && dto.name.trim() !== '' ? dto.name : existing.name,
      username: dto.username && dto.username.trim() !== '' ? dto.username : existing.username,
      password: dto.password && dto.password.trim() !== '' ? await argon2.hash(dto.password) : undefined, // tylko jeśli hasło
      role: dto.role ?? existing.role,
      isActive: dto.isActive ?? existing.isActive,
      isBlocked: dto.isBlocked ?? existing.isBlocked,
      isEmailConfirmed: dto.isEmailConfirmed ?? existing.isEmailConfirmed,
      failedLoginAttempts: dto.failedLoginAttempts ?? existing.failedLoginAttempts,
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updatedData,
    })

    return { message: `Użytkownik ${updated.email} został zaktualizowany.` }
  }


  async blockUser(id: string, current: JwtRequestUser): Promise<{ message: string }> {
    if (id === current.id) throw new SelfModificationForbiddenException('block')

    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new UserNotFoundException()

    const updated = await this.prisma.user.update({
      where: { id },
      data: { isBlocked: true },
    })

    return { message: `Użytkownik ${updated.email} został zablokowany.` }
  }

  async deleteUser(id: string, current: JwtRequestUser): Promise<{ message: string }> {
    if (id === current.id) throw new SelfModificationForbiddenException('delete')

    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new UserNotFoundException()

    await this.prisma.user.delete({ where: { id } })

    return { message: 'Użytkownik został usunięty.' }
  }

  async createUser(dto: CreateUserDto, current: JwtRequestUser,): Promise<{ message: string }> {
    if (
      dto.role &&
      this.isRoleHigher(dto.role, current.role)
    ) {
      throw new UserInvalidRoleChangeException()
    }
    const hashedPassword = await argon2.hash(dto.password)
    console.log(`Creating user with email: ${dto.email}`)
    console.log(dto)
    const created = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        username: dto.username ?? '',
        name: dto.name ?? '',
        role: dto.role ?? UserRole.USER,
      },
    })

    return { message: `Użytkownik ${created.email} został utworzony.` }
  }

  private toDto(user: any): UserDto {
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      name: user.name,
      role: user.role,
      isActive: user.isActive,
      isBlocked: user.isBlocked,
      twoFactorEnabled: user.twoFactorEnabled,
      failedLoginAttempts: user.failedLoginAttempts,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }
  }

  private isRoleHigher(target: UserRole, current: UserRole): boolean {
    const priority: Record<UserRole, number> = {
      GUEST: 0,
      USER: 1,
      MODERATOR: 2,
      ADMIN: 3,
      SYSTEM: 4,
      ROOT: 5,
    }
    return priority[target] >= priority[current]
  }
}
// EOF
