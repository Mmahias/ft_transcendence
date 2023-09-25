import { Module, MiddlewareConsumer, RequestMethod, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GameGateway } from './game/game.gateway';
import { HttpsMiddleware } from './https/https-middleware';
import { TestModule } from './test/test.module';
import { LoggerMiddleware } from './middlewares/logger-middleware';
import cookieParser from 'cookie-parser';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    ChatModule,
    AuthModule,
    TestModule
  ],
  providers: [GameGateway]
})
export class AppModule {
  constructor(private configService: ConfigService) {}

  configure(consumer: MiddlewareConsumer) {
    const secret = this.configService.get<string>('COOKIE_SECRET');
    consumer
      .apply(LoggerMiddleware, cookieParser(secret))
      .forRoutes({ path: '*', method: RequestMethod.ALL });
  }
}
