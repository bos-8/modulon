// @file: server/src/modules/user/dashboard/dashboard.service.ts

import { Injectable, BadRequestException, ForbiddenException } from '@nestjs/common'
import { PrismaService } from '@/database/prisma.service'
import { DashboardDto, UpdateUserDashboardDto, ChangePasswordDto } from './dashboard.dto'
import * as argon2 from 'argon2'


@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) { }

  async getUserDashboard(userId: string): Promise<DashboardDto> {
    // sprawdz czy istnieje personalData – jeśli nie, utwórz pusty wpis
    const userWithPersonalData = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { personalData: true },
    })

    if (!userWithPersonalData) throw new Error('User not found')

    if (!userWithPersonalData.personalData) {
      await this.prisma.personalData.create({
        data: {
          userId: userId,
        },
      })
    }

    const user = await this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: { personalData: true },
    })

    const {
      id, email, username, name, role, image, lastLoginAt, createdAt, personalData
    } = user

    return {
      id, email, username, name, role, image, lastLoginAt, createdAt,
      personalData: {
        firstName: personalData?.firstName ?? null,
        middleName: personalData?.middleName ?? null,
        lastName: personalData?.lastName ?? null,
        phoneNumber: personalData?.phoneNumber ?? null,
        address: personalData?.address ?? null,
        city: personalData?.city ?? null,
        zipCode: personalData?.zipCode ?? null,
        country: personalData?.country ?? null,
        birthDate: personalData?.birthDate ?? null,
        gender: personalData?.gender ?? null,
      },
    }
  }

  async updateUserDashboard(userId: string, dto: UpdateUserDashboardDto) {
    const { username, name, ...personalData } = dto

    const cleanPersonalData = {
      ...personalData,
      birthDate: personalData.birthDate ? new Date(personalData.birthDate) : undefined,
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        username,
        name,
        personalData: {
          update: cleanPersonalData,
        },
      },
    })

    return { message: 'Profil zaktualizowany pomyślnie.' }
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } })
    if (!user) throw new BadRequestException('Użytkownik nie istnieje.')

    const isValid = await argon2.verify(user.password, dto.currentPassword)
    if (!isValid) throw new ForbiddenException('Błędne aktualne hasło.')

    const newHash = await argon2.hash(dto.newPassword)

    await this.prisma.user.update({
      where: { id: userId },
      data: { password: newHash },
    })
  }
}
// EOF
