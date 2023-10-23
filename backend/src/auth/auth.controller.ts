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
import { TwoFaAuth } from '@app/auth/dto/two-fa-auth';
import { User } from '@app/user/decorator';
import { LocalAuthGuard } from '@app/auth/strategies/local/local-auth.guard';
import { Jwt2faAuthGuard } from '@app/auth/strategies/jwt-2fa/jwt-2fa-auth-guard';

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
    return await this.authService.login(user, false);
  }

  /*
      Login with username password
   */
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@User() user) {
    return await this.authService.login(user, false);
  }

  /*
      Create a new account
   */
  @Post('signup')
  async signup(@Body() body: RegisterDto) {
    const user = await this.userService.createUser(
      body.username,
      body.password,
      body.nickname
    );
    return await this.authService.login(user, false);
  }

  /*
      2FA authentication
   */
  @Post('2fa/generate')
  @UseGuards(Jwt2faAuthGuard)
  async register(@Res() response, @User() user) {
    const { otpAuthUrl } =
      await this.authService.generateTwoFactorAuthenticationSecret(user);

    return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
  }

  @Get('2fa/is-turn-on')
  @UseGuards(Jwt2faAuthGuard)
  async isTurnOnTwoFactorAuthentication(@User('id') userId: number) {
    const user = await this.userService.getUserById(userId);
    const { authenticationEnabled } = user;

    console.log(authenticationEnabled);
    return { isAuthenticationEnabled: authenticationEnabled };
  }

  @Post('2fa/turn-on')
  @UseGuards(Jwt2faAuthGuard)
  async turnOnTwoFactorAuthentication(@User() user, @Body() body: TwoFaAuth) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.turnOnTwoFactorAuthentication(user.id);
    return await this.authService.login(user, true);
  }

  @Post('2fa/turn-off')
  @UseGuards(Jwt2faAuthGuard)
  async turnOffTwoFactorAuthentication(@User() user) {
    await this.userService.turnOffTwoFactorAuthentication(user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(Jwt2faAuthGuard)
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

  @Post('logout')
  async logout(@Body('userId') userId: number) {
    return this.authService.logout(userId);
  };
}
