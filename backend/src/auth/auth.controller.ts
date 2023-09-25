import { Response } from 'express';
import { Controller, Get, Logger, Req, UseGuards, Post, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public-decorator';
import AuthDto from './dto/auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);
  @UseGuards(AuthGuard('oauth_42'))
  @Get('')
  oauthLogin() {
    return;
  }

  @UseGuards(AuthGuard('oauth_42'))
  @Get('redirect')
  oauthRedirect(@Req() req) {
    // Return the jwt created
    return req.user;
  }

  @Public()
  @Post('signup')
  signup(@Body() body: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.signup(body, res);
  }

  @Public()
  @Post('login')
  login(@Body() body: AuthDto, @Res({ passthrough: true }) res: Response) {
    return this.authService.login(body, res);
  }
}
