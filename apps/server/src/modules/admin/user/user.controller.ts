// @file: server/src/modules/admin/user/user.controller.ts

import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  UseGuards,
  ParseUUIDPipe,
  Delete,
  ForbiddenException,
  Query
} from '@nestjs/common'
import { UserService } from './user.service'
import { Roles } from '@/decorators/roles.decorator'
import { UserRole } from '@prisma/client'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import {
  CreateUserDto,
  UpdateUserDto,
  UserDto,
  GetUsersQueryDto,
  PaginatedUsersResponse
} from './user.dto'
import { CurrentUser } from '@/decorators/current.user.decorator'
import { JwtRequestUser } from '@/interfaces/jwt.request.user.interface'

@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ROOT)
export class UserController {
  constructor(private readonly userService: UserService) { }

  // @Get()
  // async getAllUsers(): Promise<UserDto[]> {
  //   return this.userService.getAllUsers()
  // }

  @Get(':id')
  async getUserById(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserDto> {
    return this.userService.getUserById(id)
  }

  @Get()
  async getUsers(@Query() query: GetUsersQueryDto): Promise<PaginatedUsersResponse> {
    return this.userService.getUsers(query)
  }

  @Post()
  async createUser(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.createUser(dto, user)
  }

  @Patch(':id')
  async updateUser(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.updateUser(id, dto, user)
  }

  @Patch(':id/block')
  async softDeleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtRequestUser,
  ): Promise<{ message: string }> {
    return this.userService.blockUser(id, user)
  }

  @Delete(':id')
  async deleteUser(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: JwtRequestUser,
  ): Promise<{ message: string }> {
    if (user.id === id) {
      throw new ForbiddenException('Nie możesz usunąć samego siebie.')
    }
    return this.userService.deleteUser(id, user)
  }
}
// EOF