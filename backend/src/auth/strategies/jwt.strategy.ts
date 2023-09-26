import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/users/users.service';

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
