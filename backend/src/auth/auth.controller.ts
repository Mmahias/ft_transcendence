import {
    Body,
    Controller,
    HttpCode,
    HttpStatus,
    Post,
    Req,
  } from '@nestjs/common';
  import { AuthService } from './auth.service';
  import { AuthDto, LoginDto } from './dto';
  
  @Controller('auth')
  export class AuthController {
    constructor(private authService: AuthService) {}

    @Post('signup')
    signup(@Body() dto: AuthDto) {
      return this.authService.signup(dto);
    }
    
    @HttpCode(HttpStatus.OK)
    @Post('signin')
    signin(@Body() LoginDto: LoginDto) {
      return this.authService.signin(LoginDto);
    }
  }