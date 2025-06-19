// @file: server/src/app.service.ts
import { Injectable } from '@nestjs/common';
import { UserRole } from '@modulon/types';

@Injectable()
export class AppService {
  getHello(): string {
    return `Hello World! User Role: ${UserRole.ADMIN}`;
  }
}
