import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import authConfig from './auth.config'
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { UserModule } from './modules/admin/user/user.module';
import { SessionModule } from './modules/admin/session/session.module';
import { DashboardModule } from './modules/user/dashboard/dashboard.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
      ignoreEnvFile: false,
      load: [authConfig],
    }),
    PrismaModule,
    AuthModule,
    ThrottlerModule.forRootAsync({
      useFactory: (config: ConfigService) => ({
        throttlers: [
          {
            name: 'global',
            ttl: config.get<number>('RATE_LIMIT_TTL'),
            limit: config.get<number>('RATE_LIMIT_LIMIT'),
            blockDuration: config.get<number>('RATE_LIMIT_BLOCK_DURATION'),
          },
        ],
      }),
      inject: [ConfigService],
    }),
    UserModule,
    SessionModule,
    DashboardModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    }
  ],
})
export class AppModule { }
