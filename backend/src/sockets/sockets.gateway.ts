import {
  WebSocketGateway,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayInit,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { SocketService } from './sockets.service';
import { Server, Socket } from 'socket.io';
import { usernameMiddleware } from './middleware/username.middleware';
import { JwtService } from '@nestjs/jwt';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const corsConfig = {
  origin: '*', // replace with your front-end domain/port
  credentials: true,
};

@WebSocketGateway({ cors: corsConfig })
export class SocketsGateway
  implements OnGatewayConnection, OnGatewayInit, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService
  ) {}

  /* Attribue le nickname au socket ouvert à partir de son jwt */
  afterInit(server: Server) {
    server.use(usernameMiddleware(this.jwtService));
    console.log('WS Initialized');
  }

  /* Indique dans le User scheme qu'il est actif */
  async handleConnection(client: Socket, ...args: any[]) {
    void (args);

    await this.socketService.activeUser(client.data.userId);

    /* Stocker tous les sockets des users actuellement connectés dans un map */
    this.socketService.registerActiveSockets(client.data.userId, client.id);

    /* Reconnecter le client à son match s'il en avait un en cours */
    this.socketService.cleanupMatches();
    // const match = this.getMatchByUserId(client.data.userId);
    const match = undefined;
    if (match !== undefined) {
      client.join(match.matchId.toString());
      switch (client.data.userId) {
        case match.player1.userId:
          match.player1.ready = true;
          break;
        case match.player2.userId:
          match.player2.ready = true;
          break;
        default:
          break;
      }
    }
  }

  /* Indique dans le User scheme qu'il est inactif et le déconnecte */
  handleDisconnect(client: Socket) {
    this.socketService.inactiveUser(client.data.userId);
    this.socketService.deleteDisconnectedSockets(client.data.userId);

    // Tell the match the user has disconnected
    // const match = this.getMatchByUserId(client.data.userId);
    const match = undefined;
    if (match !== undefined) {
      switch (client.data.userId) {
        case match.player1.userId:
          match.player1.ready = false;
          break;
        case match.player2.userId:
          match.player2.ready = false;
          break;
        default:
          break;
      }
    }

    // Remove user from queue if they were in it
    for (let i = 0; i < this.socketService.queue.length; i++) {
      if (this.socketService.queue[i].userId === client.data.userId) {
        this.socketService.queue.splice(i, 1);
        break;
      }
    }

    client.disconnect(true);
  }

  /* ######################### */
  /* ######### TEST ########## */
  /* ######################### */

  @SubscribeMessage('test-event')
  handleTestEvent(client: Socket, data: any): Promise<any> {
    console.log('Received test event with data:', data);
    
    // Responding to the client, you can remove this if not required
    return new Promise((resolve) => {
      // Simulating asynchronous work
      setTimeout(() => {
        resolve({ event: 'test-response', data: 'Hello from server!' });
      }, 1000);
    });
  }

  /* ######################### */
  /* ######### CHAT ########## */
  /* ######################### */

  @SubscribeMessage('join lobby')
  async handleLobbyCreation(client: Socket, payload: string): Promise<void> {
    const room = payload;
    client.join(room);
  }

  /**
   * @description Message à envoyer aux listeners de l'event "receiveMessage"
   * @param client Socket de la personne qui a envoyé un message dans le Chat
   * @param payload `<roomName> <messageToTransfer>`. Exemple: "RockLovers Hello comment ça va?"
   */
  @SubscribeMessage('Chat')
  async handleSendMessage(client: Socket, payload: string): Promise<void> {
    const splitStr: string[] = payload.split('  ');

    const action = splitStr[0];
    const room = splitStr[1];
    const msgToTransfer = splitStr[2];

    if (action === "/msg") {
      const message = {
        date: new Date(),
        from: client.data.username,
        fromId: client.data.userId,
        content: msgToTransfer,
      };
      this.server.to(room).emit('receiveMessage', message);
    }
    if (action === '/mute' || action === '/kick' || action === '/ban' || action === '/admin' || action === '/invite') {
      const message = {
        date: new Date(),
        from: client.data.username,
        fromId: client.data.userId,
        content: `${action}  ${msgToTransfer}`,
      };

      this.server.to(room).emit('receiveMessage', message);
    }
  }
}
