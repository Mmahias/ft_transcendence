import { Module } from '@nestjs/common';
import { PasswordModule } from '@app/password/password.module';
import { ChatService } from './chat.service';

@Module({
  imports: [PasswordModule],
  providers: [ChatService],
  exports: [ChatService],
})
export class ChatModule {}