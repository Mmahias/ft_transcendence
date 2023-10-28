import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/user/users.service';
import { authenticator } from 'otplib';
import { User, UserStatus } from '@prisma/client';
import { toDataURL } from 'qrcode';
import { JwtPayload } from '@app/auth/entities/jwt-payload';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private prismaService: PrismaService
  ) {}

  async signToken(payload: JwtPayload) {
    const secret = this.config.get('JWT_SECRET');

    return await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: secret
    });
  }

  isTwoFactorAuthenticationCodeValid(authenticationCode: string, user: Partial<User>) {
    return authenticator.verify({
      token: authenticationCode,
      secret: user.authenticationSecret
    });
  }

  async generateTwoFactorAuthenticationSecret(user: User) {
    const secret = authenticator.generateSecret();

    const otpAuthUrl = authenticator.keyuri(user.username, 'AUTH_APP_NAME', secret);

    await this.userService.setTwoFactorAuthenticationSecret(secret, user.id);

    return { otpAuthUrl };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async login(user: Partial<User>, twoFAActivated: boolean) {
    const payload: JwtPayload = {
      sub: user.id,
      isTwoFactorAuthenticated: twoFAActivated
    };
    await this.userService.setUserStatus(user.id, UserStatus.ONLINE);
    return this.signToken(payload);
  }

  async logout(userId: number) {
    return this.userService.setUserStatus(userId, UserStatus.OFFLINE);
  }
}
