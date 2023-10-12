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

  async handleConnection(client: Socket, ...args: any[]) {
    void (args);

    // update user status to ONLINE in db and activate user's socket
    await this.socketService.goOnline(client.data.userId);
    this.socketService.addActiveSocket(client.data.userId, client.id);

    // Check and cleanup inactive matches
    this.socketService.cleanupMatches();

    // Find a match by the user ID
    const match = this.socketService.matches.find(
      m => m.player1.userId === client.data.userId || m.player2.userId === client.data.userId
    );

    if (match !== undefined) {
      client.join(match.matchId.toString());
      if (client.data.userId === match.player1.userId) {
        match.player1.ready = true;
      } else if (client.data.userId === match.player2.userId) {
        match.player2.ready = true;
      }
    }
  }

  // handle single socket disconnection
  handleDisconnect(client: Socket) {
    console.log("disconnect 1 socket");
    this.socketService.removeActiveSocket(client.data.userId, client.id);

    const userSockets = this.socketService.currentActiveUsers.get(client.data.userId);
    
    if (!userSockets || userSockets.size === 0) {
      const match = this.socketService.matches.find(
        m => m.player1.userId === client.data.userId || m.player2.userId === client.data.userId);
      if (match !== undefined) {
        if (client.data.userId === match.player1.userId) {
          match.player1.ready = false;
        } else if (client.data.userId === match.player2.userId) {
          match.player2.ready = false;
        }
      }

      // Remove user from queue if they were in it
      const userIndex = this.socketService.queue.findIndex(
        player => player.userId === client.data.userId);
      if (userIndex !== -1) {
        this.socketService.queue.splice(userIndex, 1);
      }
      
      // update user status to OFFLINE in db
      this.socketService.goOffline(client.data.userId);

      }
      
    client.disconnect(true);
  }

  handleDisconnectAll(client: Socket) {
    console.log("disconnect all sockets");
    const userSockets = this.socketService.currentActiveUsers.get(client.data.userId);
    if (userSockets) {
      for (const socketId of userSockets) {
        const socketToDisconnect = this.server.sockets.sockets.get(socketId);
        if (socketToDisconnect) {
          socketToDisconnect.emit('forceLogout');
          socketToDisconnect.disconnect(true);
          this.socketService.removeActiveSocket(client.data.userId, socketId);
        }
      }
    }
  }

/* ######################### */
/* ######### TEST ########## */
/* ######################### */

  @SubscribeMessage('test-event')
  handleTestEvent(client: Socket, data: any): Promise<any> {
    console.log('Received test event with data:', data);
    
    console.log('Current active users:', this.socketService.currentActiveUsers);
    
    // Responding to the client, you can remove this if not required
    return new Promise((resolve) => {
      // Simulating asynchronous work
      setTimeout(() => {
        resolve({ event: 'test-response', data: 'Hello from server!' });
      }, 1000);
    });
  }

  /* ######################### */
  /* ######## STATUS ######### */
  /* ######################### */

  @SubscribeMessage('forceDisconnectAll')
  handleForceDisconnectAll(client: Socket) {
    this.handleDisconnectAll(client);
  }

  /* ######################### */
  /* ######### CHAT ########## */
  /* ######################### */

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(client: Socket, payload: string): Promise<void> {
    const room = payload;
    console.log("JOIN ROOM")
    const rooms = client.rooms;  // This should give you a Set of room IDs the client is in
    if (!rooms.has(room)) {
      client.leave(room);
    }
    client.join(room);
  }

  /**
   * @description Message à envoyer aux listeners de l'event "receiveMessage"
   * @param client Socket de la personne qui a envoyé un message dans le Chat
   * @param payload `<roomName> <messageToTransfer>`. Exemple: "RockLovers Hello comment ça va?"
   */
  @SubscribeMessage('Chat')
  async handleMessage(client: Socket, payload: string): Promise<void> {
    const splitStr: string[] = payload.split('***');

    const action = splitStr[0];
    const room = splitStr[1];
    const msgToTransfer = splitStr[2];
    // console.log('action', action, '\nroom', room, '\nmsgToTransfer', msgToTransfer);
    if (action === "/msg") {
      const message = {
        date: new Date(),
        from: client.data.username,
        fromId: client.data.userId,
        fromUsername: client.data.username,
        avatar: client.data.avatar,
        content: msgToTransfer,
      };
      this.server.to(room).emit('newMessage', message);
      console.log("rooms:", this.server.sockets.adapter.rooms);
      // client.emit('newMessage', message);
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
