import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';
import { UserService } from '@app/user/users.service';

@Injectable()
export class FriendService {
  private readonly logger = new Logger(FriendService.name);
  constructor(
    private prisma: PrismaService,
    private userService: UserService
  ) {}
  async createRequest(userId: number, friendNickname: string) {
    const { id } = await this.userService.getUserByUsername(friendNickname);

    return this.prisma.friendRequest.create({
      data: {
        fromId: userId,
        toId: id
      }
    });
  }

  async handleFriendRequest(userId: number, friendUsername: string, accept: boolean) {
    const friendRequest = await this.prisma.friendRequest.findFirst({
      where: {
        toId: userId,
        from: {
          username: friendUsername
        }
      }
    });

    if (!friendRequest) {
      this.logger.error(
        `Impossible to handle friend request from ${friendUsername}. It's not found`
      );
      throw new BadRequestException(
        `Friend request from ${friendUsername} doesn't exist`
      );
    }

    const { id, fromId } = friendRequest;

    if (accept) {
      await this.prisma
        .$transaction([
          this.prisma.user.update({
            where: { id: userId },
            data: {
              friends: {
                connect: { id: fromId }
              }
            }
          }),
          this.prisma.user.update({
            where: { id: fromId },
            data: {
              friends: {
                connect: { id: userId }
              }
            }
          })
        ])
        .catch((error) => {
          this.logger.error('Error in transaction');
          throw error;
        });
    }

    this.prisma.friendRequest.delete({
      where: {
        id
      }
    });

    return {
      response: `Friend request handle successfully. Request ${
        accept ? 'accepted' : 'refused'
      }`
    };
  }

  async deleteFriend(userId: number, friendUsername: string) {
    const user = await this.prisma.user.update({
      where: {
        id: userId
      },
      data: {
        friends: {
          disconnect: {
            username: friendUsername
          }
        }
      },
      include: {
        friends: {
          select: {
            username: true
          }
        }
      }
    });

    await this.prisma.user.update({
      where: {
        username: friendUsername
      },
      data: {
        friends: {
          disconnect: {
            id: userId
          }
        }
      }
    });

    const { friends } = user;
    return friends;
  }
}
