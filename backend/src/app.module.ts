import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '@app/user/users.module';
import { ChatModule } from './chat/chat.module';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { GameGateway } from './game/game.gateway';
import { TestModule } from './test/test.module';
import { SocketModule } from './sockets/sockets.module';
import { LoggerMiddleware } from './middlewares/logger-middleware';


@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    UserModule,
    ChatModule,
    AuthModule,
    TestModule,
    SocketModule
  ],
  providers: [GameGateway]
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');  // This applies the middleware to all routes
  }
}