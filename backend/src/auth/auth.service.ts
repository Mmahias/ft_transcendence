import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/user/users.service';
import { authenticator } from 'otplib';
import { User } from '@prisma/client';
import { toDataURL } from 'qrcode';

@Injectable()
export class AuthService {

  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService
  ) {}

  async signToken(payload: any) {
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: secret
    });
    return { accessToken: token };
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

    return {
      secret,
      otpAuthUrl
    };
  }

  async generateQrCodeDataURL(otpAuthUrl: string) {
    return toDataURL(otpAuthUrl);
  }

  async loginWith2fa(user: Partial<User>) {
    const payload = {
      sub: user.id,
      isTwoFactorAuthenticationEnabled: !!user.authenticationEnabled,
      isTwoFactorAuthenticated: true
    };

    return this.signToken(payload);
  }

  async login(user: Partial<User>) {
    const payload = {
      sub: user.id
    };
    return this.signToken(payload);
  }
}
