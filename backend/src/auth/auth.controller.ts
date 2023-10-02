import {
  Controller,
  Get,
  Req,
  UseGuards,
  Post,
  Body,
  HttpCode,
  UnauthorizedException,
  Res
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from '@app/auth/dto';
import { UserService } from '@app/user/users.service';
import { Oauth42Guard } from '@app/auth/strategies/oauth/oauth.42.guard';
import { JwtAuthGuard } from '@app/auth/strategies/jwt/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(Oauth42Guard)
  @Get('42')
  oauthLogin() {
    return;
  }

  @UseGuards(Oauth42Guard)
  @Get('42/redirect')
  async oauthRedirect(@Req() req) {
    return this.authService.login(req.user);
  }

  @UseGuards(AuthGuard('local'))
  @HttpCode(200)
  @Post('login')
  async login(@Req() req) {
    return this.authService.login(req.user);
  }

  @Post('signup')
  async signup(@Body() body: RegisterDto) {
    await this.userService.createUser(body.username, body.password, body.nickname);
    return;
  }

  @Post('2fa/generate')
  @UseGuards(AuthGuard('jwt'))
  async register(@Res() response, @Req() request) {
    const { otpAuthUrl } = await this.authService.generateTwoFactorAuthenticationSecret(
      request.user
    );

    return response.json(await this.authService.generateQrCodeDataURL(otpAuthUrl));
  }

  @Post('2fa/turn-on')
  @UseGuards(AuthGuard('jwt'))
  async turnOnTwoFactorAuthentication(@Req() request, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      request.user
    );
    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }
    await this.userService.turnOnTwoFactorAuthentication(request.user.id);
  }

  @Post('2fa/authenticate')
  @HttpCode(200)
  @UseGuards(JwtAuthGuard)
  async authenticate(@Req() req, @Body() body) {
    const isCodeValid = this.authService.isTwoFactorAuthenticationCodeValid(
      body.twoFactorAuthenticationCode,
      req.user
    );

    if (!isCodeValid) {
      throw new UnauthorizedException('Wrong authentication code');
    }

    return this.authService.loginWith2fa(req.user);
  }
}
