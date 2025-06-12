// @file: server/src/modules/admin/user/user.controller.ts

import {
  Controller,
  Get,
  Param,
  Query,
  Patch,
  Post,
  Body,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common'
import { UserService } from './user.service'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { Roles } from '@/decorators/roles.decorator'
import {
  CreateUserDto,
  GetUsersQueryDto,
  UpdateUserDto,
  UpdatePersonalDataDto,
  UserDto,
  PersonalDataDto,
  UserWithPersonalDataDto,
  PaginatedUsersResponse,
  UpdateUserWithPersonalDataDto
} from './user.dto'
import { UserRole } from '@prisma/client'
import { CurrentUser } from '@/decorators/current.user.decorator'
import { JwtRequestUser } from '@/interfaces/jwt.request.user.interface'

@Controller('admin/user')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ROOT)
export class UserController {
  constructor(private readonly userService: UserService) { }

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.userService.getUsers(query)
  }

  @Get(':id')
  async getUserWithPersonalData(@Param('id') id: string): Promise<UserWithPersonalDataDto> {
    return this.userService.getUserWithPersonalData(id)
  }

  @Post()
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() current: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.createUser(dto, current)
  }

  @Patch(':id')
  async updateUserCombined(
    @Param('id') id: string,
    @Body() dto: UpdateUserWithPersonalDataDto,
    @CurrentUser() current: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.updateUserCombined(id, dto, current)
  }


  @Patch(':id/block')
  async blockUser(
    @Param('id') id: string,
    @CurrentUser() current: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.blockUser(id, current)
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteUser(
    @Param('id') id: string,
    @CurrentUser() current: JwtRequestUser,
  ): Promise<void> {
    await this.userService.deleteUser(id, current)
  }
}
// EOF
