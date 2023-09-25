import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { Oauth42Strategy } from './strategies';
import { UserModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '@app/password/password.service';

@Module({
  imports: [HttpModule, UserModule, JwtModule],
  controllers: [AuthController],
  providers: [AuthService, Oauth42Strategy, JwtStrategy, PasswordService]
})
export class AuthModule {}
