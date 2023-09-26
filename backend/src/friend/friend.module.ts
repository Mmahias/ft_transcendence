import { Module } from '@nestjs/common';
import { FriendService } from './friend.service';
import { FriendController } from './friend.controller';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserModule } from '@app/user/users.module';

@Module({
  imports: [PrismaModule, UserModule],
  providers: [FriendService],
  controllers: [FriendController]
})
export class FriendModule {}
