// @file: server/src/modules/admin/user/user.service.ts

import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import {
  UserDto,
  UpdateUserDto,
  CreateUserDto,
  GetUsersQueryDto,
  UpdatePersonalDataDto,
  PersonalDataDto,
  UserWithPersonalDataDto,
  UpdateUserWithPersonalDataDto
} from './user.dto'
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

  async getUserById(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new UserNotFoundException()
    return this.toDto(user)
  }

  async getUserWithPersonalData(id: string): Promise<UserWithPersonalDataDto> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { personalData: true },
    })
    if (!user) throw new UserNotFoundException()

    return {
      user: this.toDto(user),
      personalData: user.personalData ? this.toPersonalDto(user.personalData) : null,
    }
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

  async updateUserCombined(
    id: string,
    dto: UpdateUserWithPersonalDataDto,
    current: JwtRequestUser,
  ): Promise<{ message: string }> {
    const { personalData, ...userFields } = dto

    // Aktualizacja usera
    await this.updateUser(id, userFields, current)

    // Aktualizacja danych personalnych (jeśli przesłane)
    if (personalData) {
      await this.updatePersonalData(id, personalData)
    }

    return { message: 'Dane użytkownika zostały zaktualizowane.' }
  }


  async updateUser(
    id: string,
    dto: UpdateUserDto,
    current: JwtRequestUser,
  ): Promise<{ message: string }> {


    const existing = await this.prisma.user.findUnique({ where: { id } })
    if (!existing) throw new UserNotFoundException()

    const isSelf = id === current.id
    const isRoleChange = dto.role !== undefined && dto.role !== existing.role
    const isTryingToSetHigherRole = dto.role && this.isRoleHigher(dto.role, current.role)

    if (isSelf && isRoleChange) {
      throw new SelfModificationForbiddenException('role-change')
    }

    if (!isSelf && isTryingToSetHigherRole) {
      throw new UserInvalidRoleChangeException()
    }


    const updatedData: UpdateUserDto = {
      name: dto.name && dto.name.trim() !== '' ? dto.name : existing.name,
      username: dto.username && dto.username.trim() !== '' ? dto.username : existing.username,
      password: dto.password && dto.password.trim() !== '' ? await argon2.hash(dto.password) : undefined,
      role: dto.role ?? existing.role,
      isActive: dto.isActive ?? existing.isActive,
      isBlocked: dto.isBlocked ?? existing.isBlocked,
      isEmailConfirmed: dto.isEmailConfirmed ?? existing.isEmailConfirmed,
      failedLoginAttempts: dto.failedLoginAttempts ?? existing.failedLoginAttempts,
      ...(dto.isEmailConfirmed && !existing.isEmailConfirmed && {
        emailVerified: new Date(),
      })
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: updatedData,
    })

    return { message: `Użytkownik ${updated.email} został zaktualizowany.` }
  }

  async updatePersonalData(userId: string, dto: UpdatePersonalDataDto): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new UserNotFoundException()

    // Import Gender enum from @prisma/client at the top if not already imported
    // import { UserRole, Gender } from '@prisma/client'

    const cleaned: UpdatePersonalDataDto = {
      firstName: dto.firstName?.trim() || undefined,
      middleName: dto.middleName?.trim() || undefined,
      lastName: dto.lastName?.trim() || undefined,
      gender: dto.gender ? dto.gender as any : undefined, // We'll map it below
      birthDate:
        typeof dto.birthDate === 'string'
          ? typeof dto.birthDate === 'string' && dto.birthDate && dto.birthDate !== '' && !isNaN(Date.parse(dto.birthDate))
            ? new Date(dto.birthDate)
            : undefined
          : dto.birthDate instanceof Date && !isNaN(dto.birthDate.getTime())
            ? dto.birthDate
            : undefined,
      phoneNumber: dto.phoneNumber?.trim() || undefined,
      address: dto.address?.trim() || undefined,
      city: dto.city?.trim() || undefined,
      zipCode: dto.zipCode?.trim() || undefined,
      country: dto.country?.trim() || undefined,
    }

    // Map gender string to Gender enum if present
    const genderEnum = dto.gender ? (dto.gender as any) : undefined;

    await this.prisma.personalData.upsert({
      where: { userId },
      update: {
        ...cleaned,
        gender: genderEnum,
      },
      create: {
        ...cleaned,
        gender: genderEnum,
        userId
      },
    })

    return { message: 'Dane personalne zostały zapisane.' }
  }


  async blockUser(id: string, current: JwtRequestUser): Promise<{ message: string }> {
    if (id === current.id) throw new SelfModificationForbiddenException('block')

    const user = await this.prisma.user.findUnique({ where: { id } })
    if (!user) throw new UserNotFoundException()

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

  async createUser(dto: CreateUserDto, current: JwtRequestUser): Promise<{ message: string }> {
    if (dto.role && this.isRoleHigher(dto.role, current.role)) {
      throw new UserInvalidRoleChangeException()
    }

    const hashedPassword = await argon2.hash(dto.password)

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
      isEmailConfirmed: user.isEmailConfirmed,
      failedLoginAttempts: user.failedLoginAttempts,
      lastLoginAt: user.lastLoginAt,
      createdAt: user.createdAt,
    }
  }

  private toPersonalDto(pd: any): PersonalDataDto {
    return {
      id: pd.id,
      userId: pd.userId,
      firstName: pd.firstName,
      middleName: pd.middleName,
      lastName: pd.lastName,
      phoneNumber: pd.phoneNumber,
      address: pd.address,
      city: pd.city,
      zipCode: pd.zipCode,
      country: pd.country,
      birthDate: pd.birthDate,
      gender: pd.gender,
      canUserEdit: pd.canUserEdit,
      createdAt: pd.createdAt,
      updatedAt: pd.updatedAt,
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
