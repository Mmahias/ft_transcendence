import { Module } from '@nestjs/common';
import { SocketService } from './sockets.service';
import { SocketsGateway } from './sockets.gateway';
import { JwtService } from '@nestjs/jwt';

@Module({
	providers: [SocketsGateway, SocketService, JwtService]
})
export class SocketModule { }
