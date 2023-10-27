import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '@app/user/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    config: ConfigService,
    private userService: UserService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: any) => {
          const data = request?.cookies['Authorization'];
          if (!data) {
            return null;
          }
          return data;
        }
      ]),
      secretOrKey: config.get('JWT_SECRET')
    });
  }

  async validate(payload: any) {
    const user = await this.userService.getUserById(payload.sub);

    if (user.authenticationEnabled && !payload.isTwoFactorAuthenticated) return null;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _, ...userWithoutPasswd } = user;
    return userWithoutPasswd;
  }
}

/*jwtFromRequest: ExtractJwt.fromExtractors([
  (request: any) => {
    console.log(request);
    const data = request?.cookies['auth-cookie'];
    if (!data) {
      return null;
    }
    return data.token;
  }
]),*/
