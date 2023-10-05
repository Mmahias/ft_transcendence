import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/user/users.service';
import { authenticator } from 'otplib';
import { User } from '@prisma/client';
import { toDataURL } from 'qrcode';
import { JwtPayload } from "@app/auth/entities/jwt-payload";
import { PasswordService } from "@app/password/password.service";
@Injectable()
export class AuthService {
  constructor(
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService
  ) {}

  async signToken(payload: JwtPayload) {
    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: secret
    });
    console.log('token: ', token);
    return { accessToken: token };
  }

  async signTokenWithUserId(userId: number) {
    const payload = { sub: userId };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: secret
    });
    return { accessToken: token };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username).catch((error) => {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Username or password is invalid');
      }
      throw error;
    });

    if (!(await this.passwordService.verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Username or password is invalid');
    }

    return this.signTokenWithUserId(user.id);
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
    console.log('test');
    return this.signToken(payload);
  }
}
