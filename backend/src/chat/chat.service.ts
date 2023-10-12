import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { PrismaClient, Prisma } from '@prisma/client';
import { PasswordService } from '@app/password/password.service';
import { UserService } from '@app/user/users.service';
import { PrismaChanMode } from '@prisma/client';
import { ChanMode } from '../shared/types';
import { toPrismaEnum } from '@app/utils/typesConverter';

const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  constructor(
    private userService: UserService,
    private readonly passwordService: PasswordService
  ) {}

  /*******
   *  API CHANNELS FUNCTIONS
   *******/

  // ------------------
  // ----- CREATE -----
  // ------------------

  async createChannel(body: CreateChannelDto) {
    const { name, ownerId, password, mode } = body;

    let hashedPwd = null;
    if (mode === ChanMode.PROTECTED && password) {
      hashedPwd = await this.passwordService.hashPassword(password);
    }
    const newPassword = password ? hashedPwd : null;
    try {
      console.log('attempting to create channel');
      console.log('pwd: ', password);
      console.log('pwd: ', hashedPwd);
      
      const createdChannel = await prisma.channel.create({
        data: {
          name,
          mode: toPrismaEnum(mode),
          password: newPassword,
          owner: { connect: { id: ownerId } },
          adminUsers: { connect: { id: ownerId } }
        }
      });
      await prisma.$transaction([
        prisma.user.update({
          where: { id: ownerId },
          data: {
            ownerChans: { connect: { id: createdChannel.id } },
            adminChans: { connect: { id: createdChannel.id } },
            joinedChans: { connect: { id: createdChannel.id } }
          }
        })
      ]);

      console.log('created channel', createdChannel);
      return createdChannel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('A channel with this name already exists');
          }
        }
      throw error; // If the error is not the known error, rethrow it.
    }
  }

  // ------------------
  // ----- READ -------
  // ------------------

  async getChannelById(id: number) {
    return await prisma.channel.findUnique({
      where: { id },
      include: {
        owner: true,
        adminUsers: true,
        joinedUsers: true,
        bannedUsers: true,
        kickedUsers: true,
        mutedUsers: true,
        messages: true
      }
    });
  }

  async getChannelByName(name: string) {
    return await prisma.channel.findUnique({
      where: { name },
      include: {
        joinedUsers: true,
        adminUsers: true,
      }
    });
  }

  // return every channels the user is in
  async getAllChannelsByUserId(id: number) {
    // fetching joinedUsers by user.id is important because it will throw an exception if user does not exist
    const user = await this.userService.getUserById(id);
    return await prisma.channel.findMany({
      where: { joinedUsers: { some: { id: user.id } } },
      include: {
        messages: true,
        joinedUsers: true, // select all user fields here but could be more efficient
        // select: {
        //   id: true,
        //   nickname: true,
        //   email: true,
        //   }
        owner: true,
        adminUsers: true,
        bannedUsers: true,
        kickedUsers: true,
        mutedUsers: true
      },
      orderBy: [{ updatedAt: 'desc' }]
    });
  }

  async getChannelsByUserIdAndMode(userId: number, mode: ChanMode) {
    const user = await this.userService.getUserById(userId);
    return await prisma.channel.findMany({
      where: {
        mode: toPrismaEnum(mode),
        joinedUsers: { some: { id: user.id } }
      }
    });
  }

  async getAccessibleChannels(userId: number) {
    return await prisma.channel.findMany({
      where: {
        OR: [{ mode: PrismaChanMode.PROTECTED }, { mode: PrismaChanMode.PUBLIC }],
        NOT: {
          joinedUsers: {
            some: { id: userId }
          }
        }
      },
      include: {
        owner: true,
        adminUsers: true,
        joinedUsers: true,
      }
    });
  }

  async compareChannelPassword(id: number, userInput: string) {
    const channel = await this.getChannelById(id);
    if (!channel) {
      throw new Error('Channel doest not exist!');
    }
    const value = await this.passwordService.verifyPassword(channel.password, userInput);
    console.log('value', value);
    return value;
  }

  // ------------------
  // ----- UPDATE -----
  // ------------------

  async updateChannelPassword(id: number, body: CreateChannelDto) {
    const newPwd = await this.passwordService.hashPassword(body.password);
    return await prisma.channel.update({
      where: { id: id },
      data: {
        password: newPwd
      }
    });
  }

  async updateChannel(channelId: number, body: UpdateChannelDto) {
    const dataToUpdate: Prisma.ChannelUpdateInput = {};
    if (body.name) {
      dataToUpdate.name = body.name;
    }
    if (body.mode) {
      dataToUpdate.mode = toPrismaEnum(body.mode);
    }
    if (body.password) {
      dataToUpdate.password = body.password;
    }
    return await prisma.channel.update({
      where: { id: channelId },
      data: dataToUpdate
    });
  }

  async updateChannelUserlist(channelId: number, body: UpdateChannelDto) {
    const { id, usergroup, action } = body;
    if (!id || !usergroup || !action) {
      throw new BadRequestException('Missing parameters');
    }
    const user = await this.userService.getUserById(id);
    if (usergroup === 'joinedUsers' && action === 'disconnect') {
      throw new ForbiddenException('Invalid request from client');
    }
    return await prisma.channel.update({
      where: { id: channelId },
      data: {
        [usergroup]: { [action]: { id: user.id } }
      }
    });
  }

  // ------------------
  // ----- DELETE -----
  // ------------------

  // first delete channel messages, then delete
  // the channel id from every users that may have it
  // in them then delete the channel data
  async deleteChannelById(id: number) {
    this.deleteMessagesByChannelId(id);
    for (const user of await this.findUsersByChannelId(id)) {
      await prisma.user.update({
        where: { id: user.id },
        data: {
          ownerChans: { disconnect: { id } },
          adminChans: { disconnect: { id } },
          joinedChans: { disconnect: { id } },
          bannedChans: { disconnect: { id } },
          kickedFromChans: { disconnect: { id } },
          mutedFromChans: { disconnect: { id } }
        }
      });
    }
    await prisma.channel.delete({
      where: { id }
    });
  }

  async deleteUserFromChannel(channelId: number, body: UpdateChannelDto) {
    if (!body.id && !body.name) {
      throw new BadRequestException('username or user id required');
    }
    const userId = body.id ? body.id : (await this.userService.getUserByUsername(body.name)).id;
    // Remove the user from all userlists (could be refined if necessary)
    await prisma.channel.update({
      where: {
        id: channelId
      },
      data: {
        adminUsers: { disconnect: { id: userId } },
        joinedUsers: { disconnect: { id: userId } },
        bannedUsers: { disconnect: { id: userId } },
        kickedUsers: { disconnect: { id: userId } },
        mutedUsers: { disconnect: { id: userId } }
      }
    });

    // if the user is the owner of the channel
    const channel = await prisma.channel.findUnique({
      where: { id: channelId },
      include: {
        adminUsers: true,
        joinedUsers: true
      }
    });

    if (channel.ownerId === userId) {
      let newOwnerId = null;

      // check for the oldest admin
      if (channel.adminUsers.length > 0) {
        channel.adminUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        newOwnerId = channel.adminUsers[0].id;
      }
      // if no admin found, check for the oldest joined user
      else if (channel.joinedUsers.length > 0) {
        channel.joinedUsers.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
        newOwnerId = channel.joinedUsers[0].id;
      }

      // if a new owner is found, update the ownership
      if (newOwnerId) {
        await prisma.channel.update({
          where: { id: channelId },
          data: { ownerId: newOwnerId }
        });
      }
      // if no new owner is found, delete the channel
      else {
        await prisma.channel.delete({ where: { id: channelId } });
      }
    }
  }

  /*******
   *  API MESSAGES FUNCTIONS
   *******/

  async createMessage(body: CreateMessageDto) {
    const { fromId, to, content, channelId, fromUsername } = body;

    await prisma.channel.update({
      where: { id: channelId },
      data: {
        updatedAt: new Date(),
        nbMessages: { increment: 1 },
      }
    });
    
    return await prisma.message.create({
      data: {
        from: { connect: { id: fromId } },
        fromUsername,
        to,
        content,
        channel: { connect: { id: channelId } }
      }
    });
  }

  async getAllMessagesByChannelId(channelId: number) {
    return await prisma.message.findMany({
      where: { channelId },
      orderBy: { date: 'asc' },
      include: {
        from: {
          select: {
            id: true,
            avatar: true,
            nickname: true
          }
        }
      }
    });
  }

  /*******
   *  AUXILIARY FUNCTIONS
   *******/

  async deleteMessagesByChannelId(id: number) {
    await prisma.message.deleteMany({
      where: { channel: { id } }
    });
  }

  async findUsersByChannelId(id: number) {
    return await prisma.user.findMany({
      where: {
        OR: [
          { ownerChans: { some: { id } } },
          { adminChans: { some: { id } } },
          { joinedChans: { some: { id } } },
          { bannedChans: { some: { id } } },
          { kickedFromChans: { some: { id } } },
          { mutedFromChans: { some: { id } } }
        ]
      }
    });
  }
}
