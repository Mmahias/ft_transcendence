import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import {User} from "./decorator";
import {UserDto} from "./dto";

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  @Get('/me')
  async userInformation(@User('id') id: number): Promise<UserDto> {
    const user = await this.userService.getUserById(id);
    return {
      id: user.id,
      nickname: user.nickname
    };
  }

  @Get()
  async allUsers() {
    return this.userService.getAllUser();
  }
}
