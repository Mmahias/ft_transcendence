import {
  Controller,
  Get,
  UseGuards,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res,
  Logger
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/auth/dto';
import { UserService } from '@app/user/users.service';
import { Oauth42Guard } from '@app/auth/strategies/oauth/oauth.42.guard';
import { TwoFaAuth } from '@app/auth/dto/two-fa-auth';
import { User } from '@app/user/decorator';
import { LocalAuthGuard } from '@app/auth/strategies/local/local-auth.guard';
import { Jwt2faAuthGuard } from '@app/auth/strategies/jwt-2fa/jwt-2fa-auth-guard';

const cookieAuthConfig = {
  expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
  httpOnly: true,
  sameSite: 'strict'
};

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
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
  async oauthRedirect(@User() user, @Res() res) {
    const tokenJwt = await this.authService.login(user, false);

    res.cookie('Authorization', tokenJwt, tokenJwt);
    if (user.authenticationEnabled) {
      res.redirect('http://localhost:3001/facode');
      return;
    }
    res.redirect('http://localhost:3001/');
  }

  /*
      Login with username password
   */
  @UseGuards(LocalAuthGuard)
  @HttpCode(200)
  @Post('login')
  async login(@User() user, @Res() res) {
    const tokenJwt = await this.authService.login(user, false);
    res.cookie('Authorization', tokenJwt, tokenJwt);

    if (user.authenticationEnabled) {
      res.redirect('http://localhost:3001/facode');
      return;
    }
    res.redirect('http://localhost:3001/');
  }

  /*
      Create a new account
   */
  @Post('signup')
  async signup(@Body() body: RegisterDto, @Res() res) {
    const user = await this.userService.createUser(
      body.username,
      body.password,
      body.nickname
    );

    const tokenJwt = await this.authService.login(user, false);
    res.cookie('Authorization', tokenJwt, tokenJwt);
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

  @Post('2fa/turn-on')
  @UseGuards(Jwt2faAuthGuard)
  async turnOnTwoFactorAuthentication(@User() user, @Body() body: TwoFaAuth, @Res() res) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    await this.userService.turnOnTwoFactorAuthentication(user.id);
    const jwtToken = await this.authService.login(user, true);
    res.cookie('Authorization', jwtToken, cookieAuthConfig).send('');
  }

  @Get('2fa/is-turn-on')
  @UseGuards(Jwt2faAuthGuard)
  async isTurnOnTwoFactorAuthentication(@User('id') userId: number) {
    const user = await this.userService.getUserById(userId);
    const { authenticationEnabled } = user;

    return { isAuthenticationEnabled: authenticationEnabled };
  }

  @Post('2fa/turn-off')
  @UseGuards(Jwt2faAuthGuard)
  async turnOffTwoFactorAuthentication(@User() user) {
    await this.userService.turnOffTwoFactorAuthentication(user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(Jwt2faAuthGuard)
  async authenticate(@User() user, @Body() body: TwoFaAuth, @Res() res) {
    try {
      const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
        body.twoFactorAuthenticationCode,
        user
      );

      if (!isCodeValid) {
        const error = 'Wrong authentication code';
        this.logger.error(error);
        throw new Error(error);
      }
    } catch (error) {
      const message = `2fa authentication failed. Cause: ${error.message}`;
      this.logger.error(message);
      throw new UnauthorizedException(message);
    }

    const jwtToken = await this.authService.login(user, true);
    res.cookie('Authorization', jwtToken, cookieAuthConfig).send('');
  }

  @Post('logout')
  async logout(@Body('userId') userId: number, @Res() res) {
    await this.authService.logout(userId);

    res.clearCookie('Authorization').redirect('http://localhost:3001/');
  }
}
