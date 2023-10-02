import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/auth/dto';
import { UserService } from '@app/user/users.service';
import { Oauth42Guard } from '@app/auth/strategies/oauth/oauth.42.guard';
import { JwtAuthGuard } from '@app/auth/strategies/jwt/jwt-auth.guard';
import { TwoFaAuth } from '@app/auth/dto/two-fa-auth';
import { User } from '@app/user/decorator';
import { LocalAuthGuard } from '@app/auth/strategies/local/local-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  /*
      Login with Oauth 42 intra
   */
  @UseGuards(Oauth42Guard)
  @Get('42')
  oauthLogin() {
    return;
  }

  @UseGuards(Oauth42Guard)
  @Get('42/redirect')
  async oauthRedirect(@User() user) {
    return this.authService.login(user, false);
  }

  /*
      Login with username password
   */
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@User() user) {
    return this.authService.login(user, false);
  }

  /*
      Create a new account
   */
  @Post('signup')
  async signup(@Body() body: RegisterDto) {
    await this.userService.createUser(body.username, body.password, body.nickname);
    return;
  }

  /*
      2FA authentication
   */
  @Post('2fa/generate')
  @UseGuards(JwtAuthGuard)
  async register(@Res() response, @User() user) {
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(user);

    return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
  }

  @Post('2fa/turn-on')
  @UseGuards(JwtAuthGuard)
  async turnOnTwoFactorAuthentication(@User() user, @Body() body: TwoFaAuth) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.turnOnTwoFactorAuthentication(user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(@User() user, @Body() body: TwoFaAuth) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.login(user, true);
  }
}
