import { Controller, Get, Param, UseGuards, Query } from '@nestjs/common';
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
}
