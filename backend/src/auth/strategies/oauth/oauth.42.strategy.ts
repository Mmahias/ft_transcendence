import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-oauth2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../../auth.service';
import { UserService } from '@app/user/users.service';
import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class Oauth42Strategy extends PassportStrategy(Strategy, 'oauth_42') {
  private readonly logger = new Logger(Oauth42Strategy.name);
  constructor(
    private config: ConfigService,
    private authService: AuthService,
    private userService: UserService,
    private httpService: HttpService
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
      const login = await this.get42Login(accessToken);
      if (!login) {
        return done(null, false);
      }

      let user;
      // Check if the user is saved in db otherwise create it
      try {
        user = await this.userService.getUserByUsername(login);
      } catch (error) {
        if (error instanceof NotFoundException) {
          // Create a new user in DB
          user = await this.userService.createUser(login, accessToken);
        } else {
          this.logger.error(error.message);
          return done(new UnauthorizedException(), false);
        }
      }

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { password: _, ...userWithoutPasswd } = user;
      done(null, userWithoutPasswd);
    } catch (error) {
      this.logger.error(error.message);
      done(new UnauthorizedException(), false);
    }
  }

  private async get42Login(accessToken: string): Promise<string> {
    const axiosResponse = await firstValueFrom(
      this.httpService
        .get('https://api.intra.42.fr/v2/me', {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        })
        .pipe(
          catchError((error: AxiosError) => {
            this.logger.error(`Oauth authentication failed: ${error.message}`);
            throw new BadGatewayException('Error while authentication');
          })
        )
    );

    const { login } = axiosResponse.data;
    return login;
  }
}
