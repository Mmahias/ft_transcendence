import { Controller, Get, Logger, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);

  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(AuthGuard('oauth_42'))
  @Get('42')
  oauthLogin() {
    return;
  }

  @UseGuards(AuthGuard('oauth_42'))
  @Get('42/redirect')
  oauthRedirect(@Req() req) {
    // Return the jwt created
    return req.user;
  }

  @UseGuards(AuthGuard('local'))
  @Post('login')
  async login(@Req() req) {
    // Return the jwt created
    return req.user;
  }

  @Post('signup')
  async signup(@Body() body: RegisterDto) {
    await this.userService.createUser(body.username, body.password, body.nickname);
    return;
  }
}
