import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService
  ) {}

  async get42Login(accessToken: string) {
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

    const { login, email } = axiosResponse.data;
    return { login, email };
  }

  async signToken(userId: number) {
    const payload = { sub: userId };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '60m',
      secret: secret
    });

    return {
      access_token: token
    };
  }
}
