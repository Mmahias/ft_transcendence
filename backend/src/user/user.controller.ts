import { Response } from 'express';
import { Controller, Get, UseGuards, Query, Post, Res, Req } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('me')
  async userInformation(@User('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get('')
  async userByNickname(@Query('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @Get()
  async allUsers() {
    return this.userService.getAllUser();
  }

  @Get('logincheck')
  checkIfLoggedIn(@User('sub') userId: number, @Req() req: Request) {
    console.log("logincheck cookies = ", (req as any).cookies);
    return this.userService.checkIfLoggedIn(userId);
  }

  @Post('logout')
  logout(@Res() res: Response) {
      res.clearCookie('jwt');
  }
}
