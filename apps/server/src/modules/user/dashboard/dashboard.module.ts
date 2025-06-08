// @file: server/src/modules/user/dashboard/dashboard.module.ts
import { Module } from '@nestjs/common';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { PrismaService } from '@/database/prisma.service';

@Module({
  controllers: [DashboardController],
  providers: [DashboardService, PrismaService]
})
export class DashboardModule { }
// EOF