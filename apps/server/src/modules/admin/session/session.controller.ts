// @file: server/src/modules/session/session.controller.ts
import { Controller, Get, Delete, Param, Query, ParseUUIDPipe, UseGuards } from '@nestjs/common'
import { SessionService } from './session.service'
import { GetUserSessionsQueryDto, GetGroupedSessionsQueryDto } from './session.dto'
import { JwtAuthGuard } from '@/guards/jwt-auth.guard'
import { RolesGuard } from '@/guards/roles.guard'
import { Roles } from '@/decorators/roles.decorator'
import { UserRole } from '@prisma/client'

@Controller('admin/session')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.ROOT)
export class SessionController {
  constructor(private readonly sessionService: SessionService) { }

  @Get()
  async getGroupedSessions(@Query() query: GetGroupedSessionsQueryDto) {
    return this.sessionService.getGroupedSessions(query)
  }

  @Get(':userId')
  async getUserSessions(
    @Query() query: GetUserSessionsQueryDto,
    @Param('userId', ParseUUIDPipe) userId: string
  ) {
    return this.sessionService.getUserSessions(query, userId)
  }

  @Delete(':id')
  async deleteSession(@Param('id', ParseUUIDPipe) id: string) {
    return this.sessionService.deleteSession(id)
  }

  @Delete('/user/:userId')
  async deleteUserSessions(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sessionService.deleteSessionsByUser(userId)
  }

  @Delete('/user/:userId/inactive')
  async deleteExpiredSessionsByUser(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sessionService.deleteExpiredSessionsByUser(userId)
  }

  @Delete('/inactive/all')
  async deleteAllExpiredSessions() {
    return this.sessionService.deleteAllExpiredSessions()
  }
}
// EOF
