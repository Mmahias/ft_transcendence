import { Module } from '@nestjs/common';
import { PasswordModule } from '@app/password/password.module';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { UserModule } from '@app/user/user.module';

@Module({
  imports: [PasswordModule, UserModule],
  providers: [ChatService],
  controllers: [ChatController],
  exports: [ChatService],
})
export class ChatModule {}