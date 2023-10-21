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
import { MatchClass, Player, GameService } from './game.service';
import { HEIGHT, WIDTH, PADDLE_LENGTH, PADDLE_PADDING, WIN_SCORE, PADDLE_WIDTH, BALL_RADIUS } from './game.constants';
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
    private readonly gameService: GameService,
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
    this.gameService.cleanupMatches();

    // Find a match by the user ID
    const match = this.gameService.matches.find(
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

    const clientUserId = client.data.userId;
    const userSockets = this.socketService.currentActiveUsers.get(clientUserId);
    
    if (!userSockets || userSockets.size === 0) {
      this.gameService.disconnect(clientUserId);
      this.socketService.goOffline(clientUserId);
    }
    client.disconnect(true);
  }

  @SubscribeMessage('forceDisconnectAll')
  handleForceDisconnectAll(client: Socket) {
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
  async handleJoinQueue(client: Socket, data: { mode: string }): Promise<void> {
    const { mode } = data;
    const userId = client.data.userId;
    const username = client.data.username;
    const socketId = client.id;
    
    this.gameService.cleanupMatches();
    console.log("JOIN QUEUE 1", this.gameService.queue);
    if (this.gameService.usersInGame.has(userId)) { return; }
    console.log("JOIN QUEUE 2", this.gameService.queue);
    const userIndex = this.gameService.addToQueue(userId, username, mode, socketId);
    console.log("JOIN QUEUE 3", this.gameService.queue);
  
    const matchedPlayerIndex = this.gameService.findMatchFromQueue(userId, mode);
  
    console.log("JOIN QUEUE", this.gameService.queue);
    if (typeof matchedPlayerIndex === "number") {
      const player1 = this.gameService.removeFromQueue(userIndex);
      const player2 = this.gameService.removeFromQueue(matchedPlayerIndex);
  
      const match = this.gameService.addMatch(mode, player1, player2);
  
      const socket1: Socket = this.getSocketBySocketId(player1.socketId);
      const socket2: Socket = this.getSocketBySocketId(player2.socketId);
      if (!socket1 || !socket2) { return; }
  
      const roomName = match.matchId.toString();
      socket1.join(roomName);
      socket2.join(roomName);
  
      this.server.to(roomName).emit('match found', match.mode);
    }
  }

  @SubscribeMessage('accept match')
  async handleAcceptMatch(client: Socket, payload: string): Promise<void> {
    void (payload);

    const userId = client.data.userId;
    const match = this.gameService.getMatchByUserId(userId);

    if (match === undefined) {
      return;
    } else if (match.player1.userId === userId) {
      match.player1.ready = true;
    } else if (match.player2.userId === userId) {
      match.player2.ready = true;
    }

    if (match.player1.ready && match.player2.ready) {

      this.gameService.goInGame(match.player1.userId, match.player1.socketId);
      this.gameService.goInGame(match.player2.userId, match.player2.socketId);

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
    this.gameService.removeUserIdFromQueue(userId);
    console.log("LEAVE QUEUE", this.gameService.queue);
  }

  @SubscribeMessage('accept match invitation')
  async handleAcceptMatchInvitation(client: Socket, username2: string): Promise<void> {

    try {
      const userId1 = client.data.userId;
      const username1 = client.data.username;

      const socketId1 = this.socketService.getActiveSockets(userId1).values().next().value;
      const socket1 = this.getSocketBySocketId(socketId1);
      if (socket1 === undefined) {
        return;
      }

      const user2 = await this.prisma.user.findUnique({
        where: {
          username: username2
        }
      });
      if (!user2) {
        return;
      }

      const userId2 = user2.id;
      const socketId2 = this.socketService.getActiveSockets(userId2).values().next().value;
      const socket2 = this.getSocketBySocketId(socketId2);
      if (socket2 === undefined) {
        return;
      }
      console.log("socket1", socket1);
      console.log("socket2", socket2);
      // Create a match with the two players
      const player1 = this.gameService.createPlayer(userId1, username1, "Classic", socket1.id);
      const player2 = this.gameService.createPlayer(userId2, username2, "Classic", socket2.id);

      const match = this.gameService.addMatch("Classic", player1, player2);
      socket1.join(match.matchId.toString());
      socket2.join(match.matchId.toString());
      this.server.to(match.matchId.toString()).emit('match invite ready', match.mode);

    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('invite match')
  async inviteMatch(client: Socket, username: string): Promise<void> {
  
    const user = await this.prisma.user.findUnique({
      where: {
        username: username
      }
    });
    if (!user) { return; }
  
    const userId = user.id;
    const socketIds = this.socketService.getActiveSockets(userId);
    if (!socketIds || socketIds.size === 0) { return; }
  
    for (const socketId of socketIds) {
      const socket = this.getSocketBySocketId(socketId);
      if (socket) {
        socket.emit('match invitation', client.data.username);
      }
    }
  }

  // TO CHECK/FIX
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
    }
  }

  /* ######################### */
  /* ######### GAME ########## */
  /* ######################### */

  @SubscribeMessage('game input')
  async handleGameInput(client: Socket, payload: number): Promise<void> {
    const userId = client.data.userId;
    const match = this.gameService.getMatchByUserId(userId);
    
    if (!match) {
      return;
    }

    const delta = (Date.now() - match.lastUpdate) / 1000; // in seconds

    // If payload is not empty, actuate user state
    if (payload && typeof payload === 'number') {
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

    // Collision with top or bottom of the canvas
    if (match.ballY + (match.ballSpeedY * delta) - BALL_RADIUS < 0 
        || match.ballY + (match.ballSpeedY * delta) + BALL_RADIUS > HEIGHT) {
      match.ballSpeedY *= -1.05;
    }

    // Collision with left side or paddle
    if (match.ballX + (match.ballSpeedX * delta) - BALL_RADIUS < PADDLE_WIDTH + PADDLE_PADDING) {
      if (match.ballY > match.p1PosY && match.ballY < match.p1PosY + PADDLE_LENGTH) {
        // Bounces on the paddle
        match.ballSpeedX *= -1.4;
        match.ballSpeedY *= 1.2;
      } else {
        // GOAL!
        match.player2.score += 1;
        this.resetMatch(match);
        if (match.player2.score >= WIN_SCORE) {
          match.ballSpeedX = 0;
          match.ballSpeedY = 0;
          this.endMatch(match);
        }
      }
    }

    // Collision with right side or paddle
    else if (match.ballX + (match.ballSpeedX * delta) + BALL_RADIUS > WIDTH - (PADDLE_WIDTH + PADDLE_PADDING)) {
      if (match.ballY > match.p2PosY && match.ballY < match.p2PosY + PADDLE_LENGTH) {
        // Bounces on the paddle
        match.ballSpeedX *= -1.4;
        match.ballSpeedY *= 1.2;
      } else {
        // GOAL!
        match.player1.score += 1;
        this.resetMatch(match);
        if (match.player1.score >= WIN_SCORE) {
          match.ballSpeedX = 0;
          match.ballSpeedY = 0;
          this.endMatch(match);
        }
      }
    }

    // Speed limits
    if (match.ballSpeedX > this.gameService.gameConstants.maxBallSpeed) {
      match.ballSpeedX = this.gameService.gameConstants.maxBallSpeed;
    } else if (match.ballSpeedX < -this.gameService.gameConstants.maxBallSpeed) {
      match.ballSpeedX = -this.gameService.gameConstants.maxBallSpeed;
    }
    if (match.ballSpeedY > this.gameService.gameConstants.maxBallSpeed) {
      match.ballSpeedY = this.gameService.gameConstants.maxBallSpeed;
    } else if (match.ballSpeedY < -this.gameService.gameConstants.maxBallSpeed) {
      match.ballSpeedY = -this.gameService.gameConstants.maxBallSpeed;
    }

    match.ballX += match.ballSpeedX * delta;
    match.ballY += match.ballSpeedY * delta;

    // Check if powerup is recovered
    if (match.powerUp) {
      const distance = Math.sqrt(Math.pow(match.powerUpX - match.ballX, 2) + Math.pow(match.powerUpY - match.ballY, 2));
      if (distance < BALL_RADIUS + this.gameService.gameConstants.powerUpRadius) {
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

    match.ballX = WIDTH / 2;
    match.ballY = HEIGHT / 2;

    // Horizontal ball speed is non null
    match.ballSpeedX = this.gameService.randomBallSpeed(200, 250);
    match.ballSpeedY = this.gameService.randomBallSpeed(160, 200);
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
      match.powerUpX = Math.random() * (WIDTH / 2) + (WIDTH / 4);
      match.powerUpY = Math.random() * HEIGHT;
      match.powerUp = true;
    }

    match.lastUpdate = Date.now();
  }


  private async endMatch(match: MatchClass): Promise<void> {

    try {
      const socket1 = this.getSocketBySocketId(match.player1.socketId);
      const socket2 = this.getSocketBySocketId(match.player2.socketId);

      if (socket1)
        this.socketService.goOnline(match.player1.userId);
      else
        this.socketService.goOffline(match.player1.userId);
      if (socket2)
        this.socketService.goOnline(match.player2.userId);
      else
        this.socketService.goOffline(match.player2.userId);

      if (socket1 === undefined || socket2 === undefined) {
        this.server.to(match.matchId.toString()).emit('match canceled');
        this.gameService.deleteMatch(match.matchId);
        return;
      }

      if (match.player1.score > match.player2.score && match.player1.score >= WIN_SCORE) {
        socket1.emit('match win', match.player1.username);
        socket2.emit('match lose', match.player2.username);
      } else if (match.player2.score > match.player1.score && match.player2.score >= WIN_SCORE) {
        socket1.emit('match lose', match.player1.username);
        socket2.emit('match win', match.player2.username);
      } else {
        this.server.to(match.matchId.toString()).emit('match canceled');
        this.gameService.deleteMatch(match.matchId);
        return;
      }

      const winner = await this.prisma.user.findUnique({
        where: {
          id: match.player1.score > match.player2.score ? match.player1.userId : match.player2.userId
        }
      });

      const loser = await this.prisma.user.findUnique({
        where: {
          id: match.player1.score < match.player2.score ? match.player1.userId : match.player2.userId
        }
      });

      const { winnerChange, loserChange } = this.gameService.getLadderPointsChange(winner.level, loser.level);

      // Update winner's ladder level
      await this.prisma.user.update({
        where: { id: winner.id },
        data: { level: winner.level + winnerChange },
      });
    
      // Update loser's ladder level
      await this.prisma.user.update({
        where: { id: loser.id },
        data: { level: loser.level - loserChange },
      });

      // Store the match result in db
      const matchDb = await this.prisma.match.create({
        data: {
          mode: match.mode,
          duration: Date.now() - match.started,
          winnerId: winner.id,
          loserId: loser.id,
          scoreWinner: match.player1.score > match.player2.score ? match.player1.score : match.player2.score,
          scoreLoser: match.player1.score < match.player2.score ? match.player1.score : match.player2.score,
        }
      });
      await this.prisma.match.update({
        where: {
          id: matchDb.id,
        },
        data: {
          winner: {
            connect: {
              id: winner.id,
            },
          },
          loser: {
            connect: {
              id: loser.id,
            },
          },
        }
      });
    } catch (error) {
      console.log(error);
    }

    return;
  }

  public getSocketOfUserInGame(userId: number): Socket | undefined {
    const socketId = this.gameService.usersInGame.get(userId);
    if (!socketId) return undefined;
    return this.server.sockets.sockets.get(socketId) || undefined;
  }

  public getSocketBySocketId(socketId: string): Socket | undefined {
    return this.server.sockets.sockets.get(socketId) || undefined;
  }
}