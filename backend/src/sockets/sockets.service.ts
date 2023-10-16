import { HttpException, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export class Player {
  userId: number;
  mode: string;
  username: string;
  score: number;
  ready: boolean;
  lastUpdate: number;
}

export class MatchClass {
  matchId: number;
  started: number;
  mode: string;	// Classic ou Custom

  networkPlayer: Player;
  localPlayer: Player;

  networkPosY: number;
  localPosY: number;

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
    width: 800, // in pixels
    height: 600, // in pixels
    paddleLength: 100, // in pixels
    paddleWidth: 10, // in pixels
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

  public async goInGame(userId: number, socketId: string) {
    this.usersInGame.set(userId, socketId);
    return await this.updateUserStatus(userId, UserStatus.IS_GAMING);
  }

  public leaveGame(userId: number) {
    this.usersInGame.delete(userId);
  }

  public async goOffline(userId: number) {
    return await this.updateUserStatus(userId, UserStatus.OFFLINE);
  }

  public getSocketIdOfUserInGame(userId: number): string | undefined {
    return this.usersInGame.get(userId);
  }

  createPlayer(userId: number, username: string, mode: string) {
    const player = new Player;
    player.userId = userId;
    player.mode = mode;
    player.username = username;
    player.score = 0;
    return player;
  }

  addToQueue(userId: number, username: string, mode: string): number {

    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].userId === userId) {
        return i;
      }
    }

    const player = this.createPlayer(userId, username, mode);
    this.queue.push(player);

    return this.queue.length - 1;
  }

  addMatch(mode: string = "Classic", networkPlayer?: Player, localPlayer?: Player): MatchClass {
    const match = new MatchClass();
    match.matchId = this.matchId++;
    match.mode = mode;

    match.networkPlayer = networkPlayer ?? this.queue.shift();
    match.localPlayer = localPlayer ?? this.queue.shift();

    match.networkPlayer.ready = false;
    match.localPlayer.ready = false;

    match.networkPosY = (this.gameConstants.height / 2) - (this.gameConstants.paddleLength / 2);
    match.localPosY = (this.gameConstants.height / 2) - (this.gameConstants.paddleLength / 2);

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
    return (match.networkPlayer.ready === false || match.localPlayer.ready === false) && (Date.now() - match.started > 10000);
  }

  private shouldDeleteDueToInactivity(match: MatchClass): boolean {
    return (Date.now() - match.networkPlayer.lastUpdate > 3000) || (Date.now() - match.localPlayer.lastUpdate > 3000);
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