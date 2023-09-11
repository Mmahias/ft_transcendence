import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy, Oauth42Strategy } from './strategy';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [JwtModule.register({}), HttpModule],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, Oauth42Strategy]
})
export class AuthModule {}
