import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from './user/user.module';
import { GameGateway } from './game/game.gateway';

@Module({
  imports: [ConfigModule.forRoot(), UserModule],
  providers: [GameGateway],
})
export class AppModule {}
