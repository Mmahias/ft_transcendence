import { Controller, Get } from '@nestjs/common';

@Controller('users')
export class UserController {
  @Get()
  allUsers() {
    return 'all users';
  }
}
