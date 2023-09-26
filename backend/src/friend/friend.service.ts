import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserService } from '@app/user/user.service';

@Injectable()
export class FriendService {
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}
  async createRequest(userId: number, friendNickname: string) {
    const { id } = await this.userService.getUserByNickname(friendNickname);

    return this.prisma.friendRequest.create({
      data: {
        fromId: userId,
        toId: id
      }
    });
  }
}
