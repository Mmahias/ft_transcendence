import { ForbiddenException, Injectable, Logger } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/user/user.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  private readonly logger = new Logger(JwtStrategy.name);
  constructor(
    config: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: cookieExtractor, // Use the custom extractor
      secretOrKey: config.get('JWT_SECRET')
    });
  }
  async validate(payload: { sub: number; nickname: string }) {
    return this.userService.getUserById(payload.sub).catch((error) => {
      this.logger.error(`Jwt is invalid: ${error.message}`);
      throw new ForbiddenException();
    });
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
