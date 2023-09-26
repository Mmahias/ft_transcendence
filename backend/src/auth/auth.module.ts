import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { Oauth42Strategy } from './strategies';
import { UserModule } from '@app/user/user.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PasswordModule } from '@app/password/password.module';
import { LocalStrategy } from '@app/auth/strategies/local.strategy';

@Module({
  imports: [HttpModule, UserModule, JwtModule, PasswordModule],
  controllers: [AuthController],
  providers: [AuthService, Oauth42Strategy, JwtStrategy, LocalStrategy]
})
export class AuthModule {}
