import {
  ForbiddenException,
  ConflictException,
  InternalServerErrorException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserUpdateDto } from './dto';
import { PasswordService } from '@app/password/password.service';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(
    private prisma: PrismaService,
    private passwordService: PasswordService
  ) {}

  async getAllUser() {
    return this.prisma.user.findMany();
  }

  async getUserById(id: number) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          id
        },
        include: {
          blockedList: true,
          matchesWon: true,
          matchesLost: true,
          friends: true,
          friendsRequestReceived: true
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`User id [${id}] is not found`);
          throw new NotFoundException(`User id [${id}] is not found`);
        }
        throw error;
      });
  }

  async getUserByNickname(nickname: string) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          nickname
        },
        include: {
          blockedList: true
        }
      })
      .catch((error) => {
        this.logger.error(error.message);
        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundException(`User with nickname [${nickname}] is not found`);
        }
        throw error;
      });
  }

  async getUserByUsername(username: string) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          username
        },
        include: {
          blockedList: true,
          matchesWon: true,
          matchesLost: true
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          const error = `Username [${username}] is not found`;
          this.logger.log(error);
          throw new NotFoundException(error);
        }
        throw error;
      });
  }

  async createUser(username: string, password: string, nickname?: string) {
    const hashPassword = await this.passwordService.hashPassword(password);
    return this.prisma.user
      .create({
        data: {
          username,
          password: hashPassword,
          nickname: nickname || username
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          switch (error.code) {
            case 'P2002': // Unique constraint violation
              throw new ConflictException(`Username [${username}] is already taken`);
            default:
              throw new InternalServerErrorException(
                `An unexpected error occurred while creating the user [${error.code}]`
              );
          }
        } else {
          throw new InternalServerErrorException('An unexpected error occurred');
        }
      });
  }

  async updateUser(id: number, fieldsToUpdate: UserUpdateDto) {
    return this.prisma.user
      .update({
        where: { id },
        data: {
          nickname: fieldsToUpdate.nickname
        }
      })
      .then((userUpdated) => {
        return {
          id: userUpdated.id,
          nickname: userUpdated.nickname
        };
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException(
              `Nickname [${fieldsToUpdate.nickname}] is already taken`
            );
          }
        }
      });
  }

  async getAvatarFilenameById(userID: number) {
    return this.prisma.user
      .findUnique({
        where: {
          id: userID
        },
        select: {
          avatar: true
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`UserId [${userID}] is not found`);
          throw new NotFoundException(`UserId [${userID}] is not found`);
        }
        throw error;
      });
  }

  async getAvatarFilenameByUsername(username: string) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          username
        },
        select: {
          avatar: true
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`Nickname [${username}] is not found`);
          throw new NotFoundException(`Nickname [${username}] is not found`);
        }
        throw error;
      });
  }

  async updateUserAvatarFilename(userId: number, filename: string) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { avatar: filename }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`User id [${userId}] is not found`);
          throw new NotFoundException(`User id [${userId}] is not found`);
        }
        throw error;
      });
  }

  async setTwoFactorAuthenticationSecret(secret: string, userId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { authenticationSecret: secret }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`User id [${userId}] is not found`);
          throw new NotFoundException(`User id [${userId}] is not found`);
        }
        throw error;
      });
  }

  async turnOnTwoFactorAuthentication(userId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { authenticationEnabled: true }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`User id [${userId}] is not found`);
          throw new NotFoundException(`User id [${userId}] is not found`);
        }
        throw error;
      });
  }

  async turnOffTwoFactorAuthentication(userId: number) {
    return this.prisma.user
      .update({
        where: { id: userId },
        data: { authenticationEnabled: false, authenticationSecret: '' }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`User id [${userId}] is not found`);
          throw new NotFoundException(`User id [${userId}] is not found`);
        }
        throw error;
      });
  }

  async searchUsers(searchTerm: string, nbUsers: number) {
    try {
      const users = await this.prisma.user.findMany({
        where: {
          username: {
            startsWith: searchTerm
          }
        },
        take: Number(nbUsers > 20 ? 20 : nbUsers),
        select: {
          id: true,
          username: true,
          avatar: true
        }
      });

      return users.map((user) => ({
        id: user.id,
        username: user.username,
        avatar: user.avatar
      }));
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(`No user found`);
      }
      throw error;
    }
  }
}
