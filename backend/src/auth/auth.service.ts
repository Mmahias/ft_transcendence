import {
  BadGatewayException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException
} from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PasswordService } from '@app/password/password.service';
import { UserService } from '@app/user/users.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly userService: UserService,
    private readonly passwordService: PasswordService
  ) {}

  async get42Login(accessToken: string): Promise<string> {
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

  async signToken(userId: number) {
    const payload = { sub: userId };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwtService.signAsync(payload, {
      expiresIn: '24h',
      secret: secret
    });
    return { access_token: token };
  }

  async validateUser(username: string, password: string) {
    const user = await this.userService.getUserByUsername(username).catch((error) => {
      if (error instanceof NotFoundException) {
        throw new UnauthorizedException('Username or password is invalid');
      }
      throw error;
    });

    if (!(await this.passwordService.verifyPassword(user.password, password))) {
      throw new UnauthorizedException('Username or password is invalid');
    }

    return this.signToken(user.id);
  }
}
