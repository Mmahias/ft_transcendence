import { Module } from '@nestjs/common';
import { SocketService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaModule } from '@app/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
	providers: [SocketsGateway, SocketService, JwtService]
})
export class SocketModule { }
