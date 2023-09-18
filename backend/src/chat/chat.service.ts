import { BadRequestException, ForbiddenException, Injectable } from '@nestjs/common';
import { CreateChannelDto } from './dto/create-channel.dto';
import { PrismaClient, Prisma, Channel } from '@prisma/client';
import { PasswordService } from '@app/password/password.service';
import { UserService } from '@app/user/user.service';
import { ChanMode, Message } from '@prisma/client';

// scrypt parameters for password hashing
const SCRYPT_PARAMS = {
  N: 16384,     // CPU/memory cost parameter. Must be a power of 2.
  r: 8,         // block size parameter
  p: 1,         // parallelization parameter
  dkLen: 64,    // derived key length in bytes
  maxmem: 0     // maximum memory (in bytes) to use
};

const prisma = new PrismaClient();

@Injectable()
export class ChatService {
  constructor(
    private userService: UserService,
    private readonly passwordService: PasswordService
  ) {}

  async createChannel(body: CreateChannelDto) {
    const { name, ownerId, password, mode } = body;
    
    let hashedPwd = null;
    if (mode === ChanMode.PROTECTED && password !== undefined) {
      hashedPwd = this.passwordService.hashPassword(password);
    }
    const newPassword = (password)? hashedPwd : null;
    try {
      const createdChannel = await prisma.channel.create({
        data: {
          name,
          mode,
          password: newPassword,
          owner: { connect: {id: ownerId}},
          adminUsers: { connect: {id: ownerId}},
        }
      });
    
      await prisma.user.update({
        where: { id: ownerId },
        data: {
          ownerChans: { connect: { id: createdChannel.id } },
          adminsChans: { connect: { id: createdChannel.id } },
          joinedChans: { connect: { id: createdChannel.id } },
        },
      });
      return createdChannel;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError) {
        if (error.code === 'P2002') {
          throw new BadRequestException('A channel with this name already exists');
        }
      }
    }
  }

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
        messages: true,
      },
    });
  }

  async getChannelByName(name: string) {
    return await prisma.channel.findUnique({
      where: { name },
      include: {
        owner: true,
        adminUsers: true,
        joinedUsers: true,
        bannedUsers: true,
        kickedUsers: true,
        mutedUsers: true,
        messages: true,
      },
    });
  }

  // return every channels the user is in
  async getAllChannelsByUserId(id: number) {

    // fetching the user at first to fetch joinedUsers by user.id is important: it will throw an exception if user does not exist
    const user = await this.userService.getUserById(id);
    return await prisma.channel.findMany({
      where: { joinedUsers: { some: { id: user.id } } },
      include: {  // passwords hashing methods (scrypt algorithm)

        messages: true,
        joinedUsers: true, // selecting all user fields here but could only select a few fields for more efficiency
        // select: {
        //   id: true,
        //   nickname: true,
        //   email: true,
        //   }
        owner: true,
        adminUsers: true,
        bannedUsers: true,
        kickedUsers: true,
        mutedUsers: true,
      },
      orderBy: [ { lastUpdate: 'desc' } ],
    });
  }

  async getPublicChannelsByUserId(id: number) {
    const user = await this.userService.getUserById(id);
    return await prisma.channel.findMany({
      where: {
        mode: ChanMode.PUBLIC,
        joinedUsers: { some: { id: user.id } },
      }
    });
  }
}