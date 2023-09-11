import {
  Controller,
  Get,
  Req,
  UseGuards,
  Headers,
  UseFilters
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';
import { TokenErrorFilter } from './error/token.error.filter';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('42')
  @UseGuards(AuthGuard('oauth_42'))
  async oAuth42() {
    return;
  }

  @UseFilters(TokenErrorFilter)
  @Get('42/redirect')
  @UseGuards(AuthGuard(['jwt', 'oauth_42']))
  async oAuth42Redirect(
    @Req() req,
    @Headers('authorization') authHeader: string
  ) {
    if (authHeader) {
      return 'Already login';
    }
    return this.authService.loginWithOAuth42(req.user);
  }
}
