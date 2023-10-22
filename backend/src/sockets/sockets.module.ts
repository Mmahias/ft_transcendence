import { Module } from '@nestjs/common';
import { SocketService } from './sockets.service';
import { GameService } from './game.service';
import { SocketsGateway } from './sockets.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '@app/prisma/prisma.module';
import { UserService } from '@app/user/users.service';
import { PasswordService } from '@app/password/password.service';

@Module({
  imports: [PrismaModule],
	providers: [SocketsGateway, SocketService, GameService, JwtService,
    UserService, PasswordService]
})
export class SocketModule { }
