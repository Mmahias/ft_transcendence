import { Controller, Get, Param, UseGuards } from '@nestjs/common';
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

  @Get(':nickname')
  async userByNickname(@Param('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @Get()
  async allUsers() {
    return this.userService.getAllUser();
  }
}
