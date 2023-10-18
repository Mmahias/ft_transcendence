import { HttpException, Injectable } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SocketService {
  constructor(
    private prisma: PrismaService,
  ) {}

  /* key = userId, Set:string = socketIds */
  // FIX IT
  // Should be set to private, just set to public for test endpoint
  public currentActiveUsers: Map<number, Set<string>> = new Map();

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

  protected async updateUserStatus(userId: number, status: UserStatus) {
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
  
  getActiveSockets(userId: number): Set<string> | undefined {
    return this.currentActiveUsers.get(userId);
  }
}