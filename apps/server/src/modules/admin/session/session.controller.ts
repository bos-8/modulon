// @file: server/src/modules/session/session.controller.ts
import { Controller, Get, Delete, Param, Query, ParseUUIDPipe } from '@nestjs/common'
import { SessionService } from './session.service'
import { GetUserSessionsQueryDto, GetGroupedSessionsQueryDto } from './session.dto'

@Controller('admin/session')
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
}
// EOF
