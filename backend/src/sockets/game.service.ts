import { HttpException, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { SocketService } from './sockets.service';
import { HEIGHT, PADDLE_LENGTH, WIDTH } from './game.constants';

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
export class GameService extends SocketService {
  constructor(
    private prismaService: PrismaService,
  ) {
    super(prismaService);
  }


  public gameConstants = {
    maxBallSpeed: 1000,
    winScore: 5,
    powerUpRadius: 20,
  };

  public usersInGame: Map<number, string> = new Map();
  public queue: Player[] = [];
  public matchId = 0;
  public matches: MatchClass[] = [];

  public async goInGame(userId: number, socketId: string) {
    if (this.usersInGame.has(userId)) { return; }
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

  public createPlayer(userId: number, username: string, mode: string, socketId: string) {
    const player = new Player;
    player.userId = userId;
    player.socketId = socketId;
    player.mode = mode;
    player.username = username;
    player.score = 0;
    return player;
  }

  public addToQueue(userId: number, username: string, mode: string, socketId: string): number {
    for (let i = 0; i < this.queue.length; i++) {
      if (this.queue[i].userId === userId) {
        return i;
      }
    }
    const player = this.createPlayer(userId, username, mode, socketId);
    this.queue.push(player);
    return this.queue.length - 1;
  }

  // Removes and returns the player from the queue by userIndex. 
  public removeFromQueue(userIndex: number): Player | null {
    return this.queue.splice(userIndex, 1)[0];
  }

  // Removes and returns the player from the queue by userId. 
  public removeUserIdFromQueue(userId: number): Player | null {
    const userIndex = this.queue.findIndex(player => player.userId === userId);
    if (userIndex === -1) return null;
    return this.removeFromQueue(userIndex);
  }

  // Finds and returns a player matching the same mode and removes both players from the queue.
  public findMatchFromQueue(userId: number, mode: string): number | null {
    const userIndex = this.queue.findIndex(player => player.userId === userId);
    if (userIndex !== -1) {
      const matchIndex = this.queue.findIndex((player) => player.mode === mode && player.userId !== userId);
      if (matchIndex !== -1) {
        return matchIndex;
      }
    }
    return null;
  }

  public randomBallSpeed(min: number, max: number): number {
    const direction = Math.random() < 0.5 ? -1 : 1;
    return direction * (min + Math.random() * (max - min));
  }

  public addMatch(mode: string = "Classic", player1?: Player, player2?: Player): MatchClass {
    const match = new MatchClass();
    match.matchId = this.matchId++;
    match.mode = mode;

    match.player1 = player1 ?? this.queue.shift();
    match.player2 = player2 ?? this.queue.shift();

    match.player1.ready = false;
    match.player2.ready = false;

    match.p1PosY = (HEIGHT / 2) - (PADDLE_LENGTH / 2);
    match.p2PosY = (HEIGHT / 2) - (PADDLE_LENGTH / 2);

    match.ballX = WIDTH / 2;
    match.ballY = HEIGHT / 2;

    match.powerUpOn = false;
    match.powerUpDate = 0;

    // Power up config
    match.powerUp = mode === "Classic" ? false : true;

    match.powerUpX = Math.random() * (WIDTH / 2) + (WIDTH / 4);
    match.powerUpY = Math.random() * HEIGHT;

    match.ballSpeedX = this.randomBallSpeed(200, 250);
    match.ballSpeedY = this.randomBallSpeed(160, 200);

    // Randomize ball direction
    if (Math.random() > 0.5) match.ballSpeedX *= -1;
    if (Math.random() > 0.5) match.ballSpeedY *= -1;

    match.started = Date.now();
    this.matches.push(match);

    return match;
  }


  public deleteMatch(matchId: number) {
    const matchIndex = this.matches.findIndex(match => match.matchId === matchId);
    if (matchIndex !== -1) {
      this.leaveGame(this.matches[matchIndex].player1.userId);
      this.leaveGame(this.matches[matchIndex].player2.userId);
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
    const matchesToDelete: number[] = [];
    this.matches.forEach(match => {
      if (this.shouldDeleteDueToReadiness(match) || this.shouldDeleteDueToInactivity(match)) {
        matchesToDelete.push(match.matchId);
      }
    });
    matchesToDelete.forEach(matchId => {
      this.deleteMatch(matchId);
    });
  }

  public disconnect(userId: number) {
    const match = this.matches.find(
      m => m.player1.userId === userId || m.player2.userId === userId);
    if (match !== undefined) {
      this.leaveGame(userId);
      if (userId === match.player1.userId) {
        match.player1.ready = false;
      } else if (userId === match.player2.userId) {
        match.player2.ready = false;
      }
      
    }
    // Remove user from queue if they were in it, from game if they were in it
    // and update their status
    this.removeUserIdFromQueue(userId);
  }
}