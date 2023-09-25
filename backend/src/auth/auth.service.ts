import { Response } from 'express';
import { BadGatewayException, Injectable, Logger, Res, ForbiddenException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { catchError, firstValueFrom } from 'rxjs';
import { AxiosError } from 'axios';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaClient } from '@prisma/client';
import { PasswordService } from '@app/password/password.service';
import AuthDto from './dto/auth.dto';

const prisma = new PrismaClient();
@Injectable()
export class AuthService {
  
  constructor(
    private readonly httpService: HttpService,
    private readonly config: ConfigService,
    private readonly jwtService: JwtService,
    private readonly passwordService: PasswordService,
    ) {}

  private readonly logger = new Logger(AuthService.name);

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
    return { access_token: token };
  }

  async signup(body: AuthDto, @Res({ passthrough: true }) res: Response) {
    try {
      // generate password hash
      let hash = await this.passwordService.hashPassword(body.password);
      
      await prisma.$transaction(async () => {
        // save the new user in the db
        const newUser = await prisma.user.create({
          data: {
            nickname: body.nickname,
            password: hash,
          },
        });
        // generate jwt token
        await this.generateToken(newUser.id, res);
      });

      return "Successfully signed up!";
    } catch (error) {
      if (error.code === "P2002")
        throw new ForbiddenException('Credentials taken');
      console.log(error);
      throw error;
    }
  }

  async login(body: AuthDto, @Res({ passthrough: true }) res: Response) {
    try {
      const activeUser = await prisma.user.findUniqueOrThrow({
        where: { nickname: body.nickname },
      })
      const pwMatch = await this.passwordService.verifyPassword(activeUser.password, body.password);
      if (pwMatch === false)
        throw new ForbiddenException('Invalid credentials');
      await this.generateToken(activeUser.id, res);

    } catch (error) {
        throw new ForbiddenException('Invalid credentials');
    }
  }

  async generateToken(userId: number, @Res() res: Response) {
    const payload = { sub: userId };
    const secret = this.config.get('JWT_SECRET');
    const jwt = await this.jwtService.signAsync(payload, {
        secret: secret,
        expiresIn: '1d'
    });

    res.cookie('jwt', jwt, {
        httpOnly: true,
        // secure: true,   set it for https only
        maxAge: 60 * 60 * 24 * 1000,
        signed: true,
        sameSite: 'lax',
    });
    return true;
  }

  async checkIfLoggedIn(userId: number | undefined): Promise<boolean> {
    if (userId === undefined) {
      return false;
    } else {
      const ret: boolean = await prisma.user.findUnique({
        where: { id: userId }
      })
        .then(user => {
          if (user) { return true; }
          return false;
        }).catch(() => { return false });
      return ret;
    }
  }
}