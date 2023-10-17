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
import { PrismaService } from '../prisma/prisma.service';
import { MatchClass, Player } from './sockets.service';
import { queue } from 'rxjs';

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
    private prisma: PrismaService,
    private readonly socketService: SocketService,
    private readonly jwtService: JwtService,
  ) {}

  /* Attribue le nickname au socket ouvert à partir de son jwt */
  afterInit(server: Server) {
    server.use(usernameMiddleware(this.jwtService));
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
      // this.socketService.leaveGame(client.data.userId);

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
    console.log("ChatSocket PING: '", payload, "'");
    const splitStr: string[] = payload.split('***');
    
    const action = splitStr[0];
    const room = splitStr[1];
    const msgToTransfer = splitStr[2];
    console.log("action = '", action, "'");
    console.log("msgToTransfer = '", msgToTransfer, "'");
    if (action === "/msg") {
      console.log("MSG: '", payload, "'");
      const message = {
        date: new Date(),
        from: client.data.username,
        fromId: client.data.userId,
        fromUsername: client.data.username,
        avatar: client.data.avatar,
        content: msgToTransfer,
      };
      this.server.to(room).emit('newMessage', message);
    }
    else if (action === '/action') {
      console.log("ACTION: '", payload, "'");
      const message = {
        date: new Date(),
        from: client.data.username,
        fromId: client.data.userId,
        content: `${action}  ${msgToTransfer}`,
      };
      this.server.to(room).emit('newMessage', message);
    }
  }

  /* ######################### */
  /* ###### MATCHMAKING ###### */
  /* ######################### */

  @SubscribeMessage('join queue')
  async handleJoinQueue(client: Socket,  data: { mode: string }): Promise<void> {

    const { mode } = data;


    const userId = client.data.userId;
    const username = client.data.username;
    const socketId = client.id;
    // add userid to queue
    const myIndex = this.socketService.addToQueue(userId, username, mode, socketId);
    this.socketService.cleanupMatches();

    let match;
    let userAtIndex;
    
    for (let i = 0; i < this.socketService.queue.length; i++) {

      userAtIndex = this.socketService.queue[i];
      if (userAtIndex.userId !== userId && userAtIndex.mode === mode) {
        match = this.socketService.addMatch(
          mode,
          this.socketService.queue.splice[i],
          this.socketService.queue.splice(myIndex, 1)[0]
        );

        const socket1: Socket = this.getSocketBySocketId(match.player1.socketId);
        const socket2: Socket = this.getSocketBySocketId(match.player2.socketId);
        if (!socket1 || !socket2) { return; }
    
        const roomName = match.matchId.toString();
        socket1.join(roomName);
        socket2.join(roomName);
    
        this.server.to(roomName).emit('match found', match.mode);
        return match;
      }
    }
  }


  @SubscribeMessage('accept match')
  async handleAcceptMatch(client: Socket, payload: string): Promise<void> {
    void (payload);

    const userId = client.data.userId;
    const match = this.socketService.getMatchByUserId(userId);

    if (match === undefined) {
      return;
    } else if (match.player1.userId === userId) {
      match.player1.ready = true;
    } else if (match.player2.userId === userId) {
      match.player2.ready = true;
    }

    if (match.player1.ready && match.player2.ready) {

      this.socketService.goInGame(match.player1.userId, match.player1.socketId);
      this.socketService.goInGame(match.player2.userId, match.player2.socketId);

      const socket1: Socket = this.getSocketOfUserInGame(match.player1.userId);
      const socket2: Socket = this.getSocketOfUserInGame(match.player2.userId);
      socket1.emit('match started', true);
      socket2.emit('match started', false);
      match.lastUpdate = Date.now();
      match.player1.lastUpdate = Date.now();
      match.player2.lastUpdate = Date.now();
    }
  }

  @SubscribeMessage('leave queue')
  async handleLeaveQueue(client: Socket, payload: string): Promise<void> {
    void (payload);
    const userId = client.data.userId;
    this.socketService.removeFromQueue(userId);
  }

  // Only Classic Mode for now
  @SubscribeMessage('invite match')
  async inviteMatch(client: Socket, username: string): Promise<void> {

    
    const user = await this.prisma.user.findUnique({
      where: {
        nickname: username
      }
    });
    
    if (!user) {
      return;
    }

    const userId = user.id;
    const socket = this.getSocketOfUserInGame(userId);
    if (socket === undefined) {
      return;
    }
    
    socket.emit('match invitation', client.data.username);
  }

  @SubscribeMessage('decline match invitation')
  async handleDeclineMatchInvitation(client: Socket, username2: string): Promise<void> {

    try {
      const userId1 = client.data.userId;
      const username1 = client.data.username;

      const socket = this.getSocketOfUserInGame(userId1);
      if (socket === undefined) {
        return;
      }

      const user2 = await this.prisma.user.findUnique({
        where: {
          nickname: username2
        }
      });
      if (!user2) {
        return;
      }

      const userId2 = user2.id;
      const socket2 = this.getSocketOfUserInGame(userId2);
      if (socket2 === undefined) {
        return;
      }

      socket2.emit('match invitation declined', username1);
    } catch (error) {
      console.log(error);
    }
  }

  /* ######################### */
  /* ######### GAME ########## */
  /* ######################### */

  @SubscribeMessage('game input')
  async handleGameInput(client: Socket, payload: number): Promise<void> {
    const userId = client.data.userId;
    const match = this.socketService.getMatchByUserId(userId);
    
    console.log("match", match)
    if (!match) {
      console.log("match not found");
      return;
    }
    console.log("0");

    const handlePlayerInactivity = (player: Player) => {
      this.server.to(match.matchId.toString()).emit('match canceled');

      if (this.getSocketOfUserInGame(player.userId)) {
          this.socketService.leaveGame(player.userId);  // Removing player from usersInGame
          this.socketService.addActiveSocket(player.userId, client.id);  // Marking player's socket as active
      } else {
          this.socketService.removeActiveSocket(player.userId, client.id);  // Removing player's socket if no active game
      }

      this.socketService.deleteMatch(match.matchId);
    };

    // Check if one of the players has disconnected for more than 3 seconds
    console.log("match.player1.lastUpdate", match.player1.lastUpdate);
    console.log("match.player1.lastUpdate", Date.now() - match.player1.lastUpdate);
    if (Date.now() - match.player1.lastUpdate > 20000) {
        handlePlayerInactivity(match.player1);
        console.log("1");
        return;
    }
    if (Date.now() - match.player2.lastUpdate > 20000) {
        handlePlayerInactivity(match.player2);
        console.log("2");
        return;
    }

    // If one of the players is not ready, do not actuate game state (Pause)
    // if (!match.player1.ready || !match.player2.ready) {
    //     // If the match has been paused for more than 10 seconds (unresponsive player), cancel it.
    //     if (Date.now() - match.lastUpdate > 10000) {
    //         handlePlayerInactivity(match.player1);
    //         handlePlayerInactivity(match.player2);
    //         return;
    //     }
    //     console.log(match.player1.ready);
    //     console.log(match.player2.ready);

    //     this.server.to(match.matchId.toString()).emit('game state', match, "pause");
    //     match.lastUpdate = Date.now();
    //     return;
    // }

    const delta = (Date.now() - match.lastUpdate) / 1000; // in seconds
    console.log("match found ok");

    // If payload is not empty, actuate user state
    if (payload) {
      switch (userId) {
        case match.player1.userId:
          {
            // Set player 1 paddle position
            match.p1PosY = payload;
            break;
          }
        case match.player2.userId:
          {
            // Set player 2 paddle position
            match.p2PosY = payload;
            break;
          }
        default:
          break;
      }
    }

    // Actuate ball state here

    // Check collisions first
    if (match.ballY + (match.ballSpeedY * delta) - this.socketService.gameConstants.ballRadius < 0 || match.ballY + (match.ballSpeedY * delta) + this.socketService.gameConstants.ballRadius > this.socketService.gameConstants.height) {
      match.ballSpeedY *= -1.05;
    }
    if (match.ballX + (match.ballSpeedX * delta) - this.socketService.gameConstants.ballRadius - this.socketService.gameConstants.paddleWidth < 0) {
      if (match.ballY > match.p1PosY && match.ballY < match.p1PosY + this.socketService.gameConstants.paddleLength) {
        // It bounces on the paddle
        match.ballSpeedX *= -1.8;
        match.ballSpeedY *= 1.2;
      }
      else {
        // GOAL!
        match.player2.score += 1;
        this.resetMatch(match);
        if (match.player2.score >= this.socketService.gameConstants.winScore) {
          match.ballSpeedX = 0;
          match.ballSpeedY = 0;
          this.endMatch(match);
        }
      }
    }
    else if (match.ballX + (match.ballSpeedX * delta) + this.socketService.gameConstants.ballRadius + this.socketService.gameConstants.paddleWidth > this.socketService.gameConstants.width) {
      if (match.ballY > match.p2PosY && match.ballY < match.p2PosY + this.socketService.gameConstants.paddleLength) {
        // It bounces on the paddle
        match.ballSpeedX *= -1.8;
        match.ballSpeedY *= 1.2;
      }
      else {
        // GOAL!
        match.player1.score += 1;
        this.resetMatch(match);
        if (match.player1.score >= this.socketService.gameConstants.winScore) {
          match.ballSpeedX = 0;
          match.ballSpeedY = 0;
          this.endMatch(match);
        }
      }
    }

    // Speed limits
    if (match.ballSpeedX > this.socketService.gameConstants.maxBallSpeed) {
      match.ballSpeedX = this.socketService.gameConstants.maxBallSpeed;
    } else if (match.ballSpeedX < -this.socketService.gameConstants.maxBallSpeed) {
      match.ballSpeedX = -this.socketService.gameConstants.maxBallSpeed;
    }
    if (match.ballSpeedY > this.socketService.gameConstants.maxBallSpeed) {
      match.ballSpeedY = this.socketService.gameConstants.maxBallSpeed;
    } else if (match.ballSpeedY < -this.socketService.gameConstants.maxBallSpeed) {
      match.ballSpeedY = -this.socketService.gameConstants.maxBallSpeed;
    }

    match.ballX += match.ballSpeedX * delta;
    match.ballY += match.ballSpeedY * delta;

    // Check if powerup is recovered
    if (match.powerUp) {
      const distance = Math.sqrt(Math.pow(match.powerUpX - match.ballX, 2) + Math.pow(match.powerUpY - match.ballY, 2));
      if (distance < this.socketService.gameConstants.ballRadius + this.socketService.gameConstants.powerUpRadius) {
        match.powerUp = false;
        match.powerUpOn = true;
        match.powerUpDate = Date.now();
      }
    }
    match.lastUpdate = Date.now();

    // Send match state to both players
    this.server.to(match.matchId.toString()).emit('game state', match);

    // Upadte player last call
    switch (userId) {
      case match.player1.userId:
        match.player1.lastUpdate = Date.now();
        break;
      case match.player2.userId:
        match.player2.lastUpdate = Date.now();
        break;
      default:
        break;
    }
  }

  private resetMatch(match: MatchClass): void {

    match.ballX = this.socketService.gameConstants.width / 2;
    match.ballY = this.socketService.gameConstants.height / 2;

    // Horizontal ball speed is non null
    match.ballSpeedX = 90;
    // Random vertical ball speed between 10 and 100
    match.ballSpeedY = Math.random() * 90 + 10;
    // Randomize ball direction
    if (Math.random() > 0.5) {
      match.ballSpeedX *= -1;
    }
    if (Math.random() > 0.5) {
      match.ballSpeedY *= -1;
    }
    match.powerUpOn = false;

    // Regenerate powerup
    const scoreTotal = match.player1.score + match.player2.score;
    if (match.powerUp === false && scoreTotal % 3 === 0) {
      match.powerUpX = Math.random() * (this.socketService.gameConstants.width / 2) + (this.socketService.gameConstants.width / 4);
      match.powerUpY = Math.random() * this.socketService.gameConstants.height;
      match.powerUp = true;
    }

    match.lastUpdate = Date.now();
  }

  private async endMatch(match: MatchClass): Promise<void> {
    return ;
  }

  public getSocketOfUserInGame(userId: number): Socket | undefined {
    const socketId = this.socketService.usersInGame.get(userId);
    if (!socketId) return undefined;
    return this.server.sockets.sockets.get(socketId) || undefined;
  }

  public getSocketBySocketId(socketId: string): Socket | undefined {
    return this.server.sockets.sockets.get(socketId) || undefined;
  }
}