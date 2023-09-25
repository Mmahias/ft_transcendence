import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserService } from '../../users/users.service';
import {
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth_42') {
  private readonly logger = new Logger(Oauth42Strategy.name);
  constructor(
    private config: ConfigService,
    private authService: AuthService,
    private userService: UserService
  ) {
    super({
      authorizationURL: config.get('AUTHORIZATION_URL'),
      tokenURL: config.get('TOKEN_URL'),
      clientID: config.get('CLIENT_ID'),
      clientSecret: config.get('CLIENT_SECRET'),
      callbackURL: config.get('CALLBACK_URL')
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback
  ) {
    try {
      // call 42 api to retrieve 42 login
      const userAuthenticated = await this.authService.get42Login(accessToken);
      if (!userAuthenticated.login || !userAuthenticated.email) {
        return done(null, false);
      }

      let user;
      // Check if the user is saved in db otherwise create it
      try {
        user = await this.userService.getUserByLogin42(userAuthenticated.login);
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Create a new user in DB
          user = await this.userService.createUser(
            userAuthenticated.login,
            userAuthenticated.email
          );
        } else {
          this.logger.error(error.message);
          return done(new UnauthorizedException(), false);
        }
      }

      const token = this.authService.signToken(user.id);
      done(null, token);
    } catch (error) {
      this.logger.error(error.message);
      done(new UnauthorizedException(), false);
    }
  }
}
