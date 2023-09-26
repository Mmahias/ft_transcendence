import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
<<<<<<< HEAD
import { UserService } from '../../users/users.service';
=======
import { UserService } from '@app/user/user.service';
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: cookieExtractor, // Use the custom extractor
      secretOrKey: config.get('JWT_SECRET')
    });
  }
  async validate(payload: { sub: number; login42: string }) {
    return this.userService.getUserById(payload.sub);
  }
}

function cookieExtractor(req: any): null | string {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies['jwt'];
  }
  console.log(`cookieExtractor: ${token}`)
  return token;
}
