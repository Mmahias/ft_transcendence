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
      m => m.networkPlayer.userId === client.data.userId || m.localPlayer.userId === client.data.userId
    );

    if (match !== undefined) {
      client.join(match.matchId.toString());
      if (client.data.userId === match.networkPlayer.userId) {
        match.networkPlayer.ready = true;
      } else if (client.data.userId === match.localPlayer.userId) {
        match.localPlayer.ready = true;
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
        m => m.networkPlayer.userId === client.data.userId || m.localPlayer.userId === client.data.userId);
      if (match !== undefined) {
        if (client.data.userId === match.networkPlayer.userId) {
          match.networkPlayer.ready = false;
        } else if (client.data.userId === match.localPlayer.userId) {
          match.localPlayer.ready = false;
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

  @SubscribeMessage('joinQueue')
  async handleJoinQueue(client: Socket,  data: { mode: string }): Promise<void> {

    const { mode } = data;

    console.log("Try to join ", mode);

    const userId = client.data.userId;
    const username = client.data.username;
    
    
    // Check if user is already in a game
    if (this.getSocketOfUserInGame(userId)) {
      client.emit('alreadyWaiting');
      console.log("Already in another queue ");
      return; // User is already in a game
    }
    
    // Add user to queue
    this.socketService.goInGame(userId, client.id);
    const myIndex = this.socketService.addToQueue(userId, username, mode);
    
    // Check if there is a match to launch
    this.socketService.cleanupMatches();
    let match;
    let userAtIndex;
    for (let i = 0; i < this.socketService.queue.length;) {

      userAtIndex = this.socketService.queue[i];

      console.log(userAtIndex.userId, userId, userAtIndex.mode, mode);
      if (userAtIndex.userId !== userId && userAtIndex.mode === mode) {

        const networkPlayer = this.socketService.queue.splice(i, 1)[0];
        const localPlayer = this.socketService.queue.splice(myIndex, 1)[0];

        match = this.socketService.addMatch(mode, networkPlayer, localPlayer);
        const socket1: Socket = this.getSocketOfUserInGame(match.networkPlayer.userId);
        const socket2: Socket = this.getSocketOfUserInGame(match.localPlayer.userId);

        if (socket1 === undefined || socket2 === undefined) {
          return;
        }

        socket1.join(match.matchId.toString());
        socket2.join(match.matchId.toString());
        this.server.to(match.matchId.toString()).emit('foundMatch', match.mode);
        console.log("Match found");
      } else {
        i++;
      }
    }
  }

  @SubscribeMessage('acceptMatch')
  async handleAcceptMatch(client: Socket, payload: string): Promise<void> {
    void (payload);

    const userId = client.data.userId;

    const match = this.getMatchByUserId(userId);
    if (match === undefined) {
      return;
    } else if (match.networkPlayer.userId === userId) {
      match.networkPlayer.ready = true;
    } else if (match.localPlayer.userId === userId) {
      match.localPlayer.ready = true;
    }

    if (match.networkPlayer.ready && match.localPlayer.ready) {

      this.socketService.goInGame(match.networkPlayer.userId, client.id);
      this.socketService.goInGame(match.localPlayer.userId, this.getSocketOfUserInGame(match.localPlayer.userId).id);

      const socket1: Socket = this.getSocketOfUserInGame(match.networkPlayer.userId);
      const socket2: Socket = this.getSocketOfUserInGame(match.localPlayer.userId);
      socket1.emit('match started', true);
      socket2.emit('match started', false);
      match.lastUpdate = Date.now();
      match.networkPlayer.lastUpdate = Date.now();
      match.localPlayer.lastUpdate = Date.now();
    }
  }

  @SubscribeMessage('leaveQueue')
  async handleLeaveQueue(client: Socket, payload: string): Promise<void> {
    void (payload);

    const userId = client.data.userId;

    // Remove user from queue
    for (let i = 0; i < this.socketService.queue.length; i++) {
      if (this.socketService.queue[i].userId === userId) {
        this.socketService.queue.splice(i, 1);
        break;
      }
    }

    this.socketService.leaveGame(userId);
  }

  // Only Classic Mode for now
  @SubscribeMessage('inviteMatch')
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
  
  // Only Classic Mode for now
  @SubscribeMessage('acceptMatchInvitation')
  async handleAcceptMatchInvitation(client: Socket, username2: string): Promise<void> {

    try {
      const userId1 = client.data.userId;
      const username1 = client.data.username;

      const socket1 = this.getSocketOfUserInGame(userId1);
      if (socket1 === undefined) {
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

      if (this.socketService.getSocketIdOfUserInGame(userId1) || this.socketService.getSocketIdOfUserInGame(userId2)) {
        return; // One of the users is already in a game
    }

      // Create a match with the two players
      const networkPlayer = this.socketService.createPlayer(userId1, username1, "Classic");
      const localPlayer = this.socketService.createPlayer(userId2, username2, "Classic");

      const match = this.socketService.addMatch("Classic", networkPlayer, localPlayer);
      socket1.join(match.matchId.toString());
      socket2.join(match.matchId.toString());
      this.server.to(match.matchId.toString()).emit('match ready', match.mode);

    } catch (error) {
      console.log(error);
    }
  }

  @SubscribeMessage('declineMatchInvitation')
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

      socket2.emit('matchInvitationDeclined', username1);
    } catch (error) {
      console.log(error);
    }
  }

  /* ######################### */
  /* ######### GAME ########## */
  /* ######################### */

  @SubscribeMessage('gameInput')
async handleGameInput(client: Socket, payload: number): Promise<void> {
  const userId = client.data.userId;
  const match = this.getMatchByUserId(userId);

  console.log("got the match", match)

  if (!match) {
      return;
  }

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
  if (Date.now() - match.networkPlayer.lastUpdate > 3000) {
      handlePlayerInactivity(match.networkPlayer);
      return;
  }
  if (Date.now() - match.localPlayer.lastUpdate > 3000) {
      handlePlayerInactivity(match.localPlayer);
      return;
  }

  // If one of the players is not ready, do not actuate game state (Pause)
  if (!match.networkPlayer.ready || !match.localPlayer.ready) {
      // If the match has been paused for more than 10 seconds (unresponsive player), cancel it.
      if (Date.now() - match.lastUpdate > 10000) {
          handlePlayerInactivity(match.networkPlayer);
          handlePlayerInactivity(match.localPlayer);
          return;
      }

      this.server.to(match.matchId.toString()).emit('game state', match, "pause");
      match.lastUpdate = Date.now();
      return;
  }

  const delta = (Date.now() - match.lastUpdate) / 1000; // in seconds

  // If payload is not empty, actuate user state
  if (payload) {
    switch (userId) {
      case match.networkPlayer.userId:
        {
          // Set player 1 paddle position
          match.networkPosY = payload;
          break;
        }
      case match.localPlayer.userId:
        {
          // Set player 2 paddle position
          match.localPosY = payload;
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
    if (match.ballY > match.networkPosY && match.ballY < match.networkPosY + this.socketService.gameConstants.paddleLength) {
      // It bounces on the paddle
      match.ballSpeedX *= -1.8;
      match.ballSpeedY *= 1.2;
    }
    else {
      // GOAL!
      match.localPlayer.score += 1;
      this.resetMatch(match);
      if (match.localPlayer.score >= this.socketService.gameConstants.winScore) {
        match.ballSpeedX = 0;
        match.ballSpeedY = 0;
        this.endMatch(match);
      }
    }
  }
  else if (match.ballX + (match.ballSpeedX * delta) + this.socketService.gameConstants.ballRadius + this.socketService.gameConstants.paddleWidth > this.socketService.gameConstants.width) {
    if (match.ballY > match.localPosY && match.ballY < match.localPosY + this.socketService.gameConstants.paddleLength) {
      // It bounces on the paddle
      match.ballSpeedX *= -1.8;
      match.ballSpeedY *= 1.2;
    }
    else {
      // GOAL!
      match.networkPlayer.score += 1;
      this.resetMatch(match);
      if (match.networkPlayer.score >= this.socketService.gameConstants.winScore) {
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

  // Send match state to only one player
  // client.emit('game state', match);

  // Upadte player last call
  switch (userId) {
    case match.networkPlayer.userId:
      match.networkPlayer.lastUpdate = Date.now();
      break;
    case match.localPlayer.userId:
      match.localPlayer.lastUpdate = Date.now();
      break;
    default:
      break;
    }
  }

  private getMatchByUserId(userId: number): MatchClass | undefined {
    for (const match of this.socketService.matches) {
      if (match.networkPlayer.userId === userId || match.localPlayer.userId === userId) {
        return match;
      }
    }
    return undefined;
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
    const scoreTotal = match.networkPlayer.score + match.localPlayer.score;
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
}