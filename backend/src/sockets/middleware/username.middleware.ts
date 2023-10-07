import { UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import * as cookieParser from 'cookie-parser';
import { UserStatus, PrismaClient } from '@prisma/client';
import { JwtService } from '@nestjs/jwt';

const prisma = new PrismaClient();

export function usernameMiddleware(jwtService: JwtService) {
  return async (client: Socket, next: (err?: any) => void) => {

    console.log('usernameMiddleware');

    // We extract the jwt from the cookies
    const jwt: string = client.handshake.auth.token;
    if (!jwt)
      return next(new UnauthorizedException('No token found.'));

    // We unsign the jwt cookie to make it readable
    const unsignedJwt = cookieParser.signedCookie(decodeURIComponent(jwt), process.env.COOKIE_SECRET);
    if (!unsignedJwt)
      return next(new UnauthorizedException('Bad cookie signature.'));

    // We check the token's validity
    try {
      const payload = await jwtService.verifyAsync(unsignedJwt, {
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
      console.log('client.data: ', client.data);
      client.data.username = user.nickname;
      client.data.userId = user.id;
      console.log('client.data: ', client.data);
      console.log('ok ');
    } catch (error) {
      return next(new UnauthorizedException('Bad token.'));
    }

    next();
  }
}
