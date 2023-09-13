import { BadGatewayException, Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService
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
}
