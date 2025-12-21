import { Controller, Get, Post } from '@nestjs/common';
import { AppService } from './app.service';
import { PrismaService } from './database/prisma/prisma.service';
import { ExampleStatus } from "@modulon/database";

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly prisma: PrismaService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post()
  create() {
    return this.prisma.exampleItem.create({
      data: { name: "Created from Nest", status: ExampleStatus.ACTIVE },
    });
  }

  @Get('list')
  list() {
    return this.prisma.exampleItem.findMany({ orderBy: { createdAt: "desc" } });
  }
}
