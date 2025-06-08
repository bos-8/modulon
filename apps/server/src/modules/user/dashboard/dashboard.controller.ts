// @file: server/src/modules/user/dashboard/dashboard.controller.ts

import { Controller, Get, UseGuards, Req, HttpCode, HttpStatus, Patch, Body } from '@nestjs/common'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { Roles } from '@/decorators/roles.decorator'
import { UserRole } from '@prisma/client'
import { DashboardService } from './dashboard.service'
import { CurrentUser } from '@/decorators/current.user.decorator'
import { JwtRequestUser } from '@/interfaces/jwt.request.user.interface'
import { UpdateUserDashboardDto, ChangePasswordDto } from './dashboard.dto'

@Controller('user/dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.USER, UserRole.MODERATOR, UserRole.ADMIN, UserRole.ROOT)
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) { }

  @Get()
  @HttpCode(HttpStatus.OK)
  async getDashboard(@CurrentUser() user: JwtRequestUser) {
    return this.dashboardService.getUserDashboard(user.id)
  }

  @Patch()
  @HttpCode(HttpStatus.OK)
  async updateDashboard(
    @CurrentUser() user: JwtRequestUser,
    @Body() dto: UpdateUserDashboardDto,
  ) {
    return this.dashboardService.updateUserDashboard(user.id, dto)
  }

  @Patch('password')
  @HttpCode(HttpStatus.NO_CONTENT)
  async changePassword(
    @CurrentUser() user: JwtRequestUser,
    @Body() dto: ChangePasswordDto,
  ) {
    await this.dashboardService.changePassword(user.id, dto)
  }
}
// EOF
