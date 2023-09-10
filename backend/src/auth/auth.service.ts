import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable({})
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService
  ) {}

  async loginWithOAuth42(login42: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        login_42: login42
      }
    });

    if (!user) {
      throw new ForbiddenException('user not found');
    }

    return this.signToken(user.user_id, user.login_42);
  }

  async signToken(userId: number, login42: string) {
    const payload = {
      sub: userId,
      login42
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret
    });

    return {
      access_token: token
    };
  }

  /*  async signup(dto: AuthDto) {
    // generate password hash
    const hash = await argon.hash(dto.password);
    try {
      // save the new user  in db
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          name: dto.name,
          hash
        }
      });
      return this.signToken(user.user_id, user.email);
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new ForbiddenException('Credentials taken');
        }
      }
      throw error;
    }
  }

  async signin(dto: LoginDto) {
    // find user by email
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email
      }
    });
    // user does not exist
    if (!user) throw new ForbiddenException('Credentials incorrect');

    // compare password
    const pwMatches = await argon.verify(user.hash, dto.password);
    // password incorrect
    if (!pwMatches) throw new ForbiddenException('Password incorrect');

    return this.signToken(user.user_id, user.email);
  }

  async signToken(
    userId: number,
    email: string
  ): Promise<{ access_token: string }> {
    const payload = {
      sub: userId,
      email
    };

    const secret = this.config.get('JWT_SECRET');

    const token = await this.jwt.signAsync(payload, {
      expiresIn: '15m',
      secret: secret
    });

    return {
      access_token: token
    };
  }*/
}
