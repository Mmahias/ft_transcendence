import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as cookieParser from 'cookie-parser';
import { UserStatus, PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

export function usernameMiddleware(jwtService: JwtService) {
  return async (client: Socket, next: (err?: any) => void) => {
    // We extract the jwt from the cookies
    const cookies: string = client.handshake.headers.cookie;
    const jwt  = cookies.split(';').find(c => c.trim().startsWith('Authorization=')).split('=')[1];
    if (!jwt)
      return next(new UnauthorizedException('No token found.'));

    try {
      const payload = await jwtService.verifyAsync(jwt, {
        secret: process.env.JWT_SECRET,
      });
      if (!payload)
        return next(new UnauthorizedException('Bad token payload.'));
      const userId = payload.sub;

      // We check if the user exists
      const user = await prisma.user.findUniqueOrThrow({
        where: {
          id: userId,
        },
      });
      if (!user)
        return next(new UnauthorizedException('No user associated with this token.'));

      // We tell that the user is active
      if (user.status === UserStatus.OFFLINE) {
        await prisma.user.update({
          where: {
            id: userId,
          },
          data: {
            status: UserStatus.ONLINE,
          },
        });
      }
      
      // We add the username to the socket instance for identification
      client.data.username = user.nickname;
      client.data.userId = user.id;
    } catch (error) {
      return next(new UnauthorizedException('Bad token.'));
    }

    next();
  }
}
