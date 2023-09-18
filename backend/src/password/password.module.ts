import { Module } from '@nestjs/common';
import { PasswordService } from '@app/password/password.service';

@Module({
  providers: [PasswordService],
  exports: [PasswordService],
})
export class PasswordModule {}