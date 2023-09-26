import { Module } from '@nestjs/common';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { PasswordModule } from '@app/password/password.module';

@Module({
  imports: [PrismaModule, PasswordModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
