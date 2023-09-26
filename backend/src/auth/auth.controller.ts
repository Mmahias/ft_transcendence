<<<<<<< HEAD
import { Response, Request } from 'express';
import { Controller, Get, Logger, Req, UseGuards, Post, Body, Res } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Public } from './decorators/public-decorator';
import AuthDto from './dto/auth.dto';
import { AuthService } from './auth.service';
import { User } from '../users/decorator';


@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  private readonly logger = new Logger(AuthController.name);
  @UseGuards(AuthGuard('oauth_42'))
  @Get('')
=======
import { Controller, Get, Req, UseGuards, Post, Body } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { UserService } from '@app/user/user.service';
import { RegisterDto } from '@app/auth/dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private userService: UserService
  ) {}

  @UseGuards(AuthGuard('oauth_42'))
  @Get('42')
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea
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

  @Get('isloggedin')
  checkIfLoggedIn(@User('sub') userId: number, @Req() req: Request) {
    console.log("logincheck cookies = ", (req as any).cookies);
    return this.authService.checkIfLoggedIn(userId);
  }

  @Post('logout')
  logout(@Res() res: Response) {
      res.clearCookie('jwt');
  }
}
