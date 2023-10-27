import {Injectable, NotFoundException, Res, UnauthorizedException} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { UserService } from '@app/user/users.service';
import { PasswordService } from '@app/password/password.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy, 'local') {
  constructor(
    private userService: UserService,
    private passwordService: PasswordService
  ) {
    super();
  }

  async validate(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username).catch((error) => {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Username is invalid');
      }
      throw error;
    });

    if (!(await this.passwordService.verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Password is invalid');
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPasswd } = user;
    return userWithoutPasswd;
  }
}
