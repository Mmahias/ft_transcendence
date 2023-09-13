import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';
import { UserService } from '../../user/user.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth_42') {
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

  async validate(accessToken: string, refreshToken: string, profile: any, done: VerifyCallback) {
    try {
      // call 42 api to retrieve 42 login
      const login42 = await this.authService.get42Login(accessToken);
      if (!login42.login || !login42.email) {
        return done(null, false);
      }

      // Check if the user is saved in db otherwise create it
      const user = await this.userService.getUserByLogin42(login42.login);
      if (!user) {
        // Create a new user in DB
      }

      // Handle response
      done(null, user);
    } catch (error) {
      done(error, false);
    }
  }
}
