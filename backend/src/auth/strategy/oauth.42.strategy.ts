import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth_42') {
  constructor(
    config: ConfigService,
    private readonly httpService: HttpService
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
    const data = await firstValueFrom(
      this.httpService.get('https://api.intra.42.fr/v2/me', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      })
    );
    const { login } = data.data;
    done(null, login);
  }
}
