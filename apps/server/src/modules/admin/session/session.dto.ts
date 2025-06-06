// @file: server/src/modules/session/dto/get-sessions.query.dto.ts

import { IsInt, IsOptional, IsString, Min } from 'class-validator'
import { Type } from 'class-transformer'

export class GetSessionsQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 25

  @IsOptional()
  @IsString()
  sort?: string

  @IsOptional()
  @IsString()
  search?: string
}
// EOF