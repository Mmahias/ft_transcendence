import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth/42')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  @UseGuards(AuthGuard('oauth_42'))
  @Get()
  oauthLogin() {
    return;
  }

  @UseGuards(AuthGuard('oauth_42'))
  @Get('/redirect')
  oauthRedirect(@Req() req) {
    // Return the jwt created
    return req.user;
  }
}
