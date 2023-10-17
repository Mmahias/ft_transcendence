import { HttpException, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CANVAS_HEIGHT, CANVAS_WIDTH, PADDLE_LENGTH,
  PADDLE_WIDTH 
  } from './game.constants'
export class Player {
  userId: number;
  mode: string;
  username: string;
  score: number;
  ready: boolean;
  lastUpdate: number;
  socketId: string;
}

export class MatchClass {
  matchId: number;
  started: number;
  mode: string;	// Classic ou Custom

  player1: Player;
  player2: Player;

  p1PosY: number;
  p2PosY: number;

  ballX: number;
  ballY: number;
  ballSpeedX: number;
  ballSpeedY: number;

  powerUp: boolean;
  powerUpOn: boolean;
  powerUpX: number;
  powerUpY: number;
  powerUpDate: number;

  lastUpdate: number;
}

@Injectable()
export class SocketService {
  constructor(
    private prisma: PrismaService,
  ) {}
  public gameConstants = {
    width: CANVAS_WIDTH(), // in pixels
    height: CANVAS_HEIGHT(), // in pixels
    paddleLength: PADDLE_LENGTH(), // in pixels
    paddleWidth: PADDLE_WIDTH(), // in pixels
    ballRadius: 5, // in pixels
    maxBallSpeed: 1000, // in pixels per second
    winScore: 10, // in points
    powerUpRadius: 20, // in pixel
  };

  /* key = userId, Set:string = socketIds */
  // FIX IT
  // Should be set to private, just set to public for test endpoint
  public currentActiveUsers: Map<number, Set<string>> = new Map();
  public usersInGame: Map<number, string> = new Map();
  public queue: Player[] = [];
  public matchId = 0;
  public matches: MatchClass[] = [];

  public addActiveSocket(userId: number, socketId: string) {
    if (!this.currentActiveUsers.has(userId)) {
      this.currentActiveUsers.set(userId, new Set());
    }
    this.currentActiveUsers.get(userId)!.add(socketId);
  }

  public removeActiveSocket(userId: number, socketId: string) {
    const userSockets = this.currentActiveUsers.get(userId);
    if (userSockets) {
      userSockets.delete(socketId);
      if (userSockets.size === 0) {
        this.currentActiveUsers.delete(userId);
      }
    }
  }

  private async updateUserStatus(userId: number, status: UserStatus) {
    try {
      return await this.prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          status,
        },
      });
    } catch (error) {
      // FIX IT
      throw new HttpException("No such user", 400);
    }
  }

  public async goOnline(userId: number) {
    return await this.updateUserStatus(userId, UserStatus.ONLINE);
  }

  public async goOffline(userId: number) {
    return await this.updateUserStatus(userId, UserStatus.OFFLINE);
  }

  public async goInGame(userId: number, socketId: string) {
    // Check if userId is already in the set
    if (this.usersInGame.has(userId)) { return; }

    // If not, add it to set
    this.usersInGame.set(userId, socketId);
    return await this.updateUserStatus(userId, UserStatus.IS_GAMING);
  }

  public leaveGame(userId: number) {
    console.log("leaveGame", this.usersInGame);
    this.usersInGame.delete(userId);
  }

  public getSocketIdOfUserInGame(userId: number): string | undefined {
    return this.usersInGame.get(userId);
  }

  public getMatchByUserId(userId: number): MatchClass | undefined {
    for (const match of this.matches) {
      if (match.player1.userId === userId || match.player2.userId === userId) {
        return match;
      }
    }
    return undefined;
  }

  createPlayer(userId: number, username: string, mode: string, socketId: string) {
    const player = new Player;
    player.userId = userId;
    player.socketId = socketId;
    player.mode = mode;
    player.username = username;
    player.score = 0;
    return player;
  }

  addToQueue(userId: number, username: string, mode: string, socketId: string): number {

    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].userId === userId) {
        return i;
      }
    }

    const player = this.createPlayer(userId, username, mode, socketId);
    this.queue.push(player);

    return this.queue.length - 1;
  }

  removeFromQueue(userId: number): void {
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].userId === userId) {
        this.queue.splice(i, 1);  // Remove the user from the queue
        break;  // Exit the loop
      }
    }
  }

  addMatch(mode: string = "Classic", player1?: Player, player2?: Player): MatchClass {
    const match = new MatchClass();
    match.matchId = this.matchId++;
    match.mode = mode;

    match.player1 = player1 ?? this.queue.shift();
    match.player2 = player2 ?? this.queue.shift();

    match.player1.ready = false;
    match.player2.ready = false;

    match.p1PosY = (this.gameConstants.height / 2) - (this.gameConstants.paddleLength / 2);
    match.p2PosY = (this.gameConstants.height / 2) - (this.gameConstants.paddleLength / 2);

    match.ballX = this.gameConstants.width / 2;
    match.ballY = this.gameConstants.height / 2;

    match.powerUpOn = false;
    match.powerUpDate = 0;

    // Power up config
    match.powerUp = mode === "Classic" ? false : true;

    match.powerUpX = Math.random() * (this.gameConstants.width / 2) + (this.gameConstants.width / 4);
    match.powerUpY = Math.random() * this.gameConstants.height;

    // Horizontal ball speed is non-null
    match.ballSpeedX = 90;
    // Random vertical ball speed between 10 and 100
    match.ballSpeedY = Math.random() * 90 + 10;

    // Randomize ball direction
    if (Math.random() > 0.5) match.ballSpeedX *= -1;
    if (Math.random() > 0.5) match.ballSpeedY *= -1;

    match.started = Date.now();
    this.matches.push(match);

    return match;
}


  deleteMatch(matchId: number) {
    const matchIndex = this.matches.findIndex(match => match.matchId === matchId);
    if (matchIndex !== -1) {
      this.matches.splice(matchIndex, 1);
    }
  }

  private shouldDeleteDueToReadiness(match: MatchClass): boolean {
    return (match.player1.ready === false || match.player2.ready === false) && (Date.now() - match.started > 10000);
  }

  private shouldDeleteDueToInactivity(match: MatchClass): boolean {
    return (Date.now() - match.player1.lastUpdate > 3000) || (Date.now() - match.player2.lastUpdate > 3000);
  }

  public cleanupMatches() {
    this.matches = this.matches.filter(match => {
        if (this.shouldDeleteDueToReadiness(match) || this.shouldDeleteDueToInactivity(match)) {
            return false;
        }
        return true;
    });
  }
}