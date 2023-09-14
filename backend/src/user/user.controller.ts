import { Controller, Get, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}
  @Get()
  async allUsers() {
    return this.userService.getAllUser();
  }
}
