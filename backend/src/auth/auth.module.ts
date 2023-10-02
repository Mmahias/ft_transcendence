import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { HttpModule } from '@nestjs/axios';
import { UserModule } from '@app/user/users.module';
import { JwtStrategy } from './strategies/jwt/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { PasswordService } from '@app/password/password.service';
import { PasswordModule } from '../password/password.module';
import { LocalStrategy } from '@app/auth/strategies/local/local.strategy';
import { Oauth42Strategy } from '@app/auth/strategies/oauth/oauth.42.strategy';
import { Jwt2faStrategy } from '@app/auth/strategies/jwt-2fa/jwt-2fa.strategy';

@Module({
  imports: [HttpModule, UserModule, JwtModule, PasswordModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    Oauth42Strategy,
    JwtStrategy,
    PasswordService,
    LocalStrategy,
    Jwt2faStrategy
  ]
})
export class AuthModule {}
