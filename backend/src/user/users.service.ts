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
          friends: {
            select: {
              id: true,
              username: true
            }
          },
          friendsRequestReceived: {
            select: { 
              id: true,
              from: {
                select: {
                  username: true
                }
              }
            }
          }
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
          nickname: nickname || username,
          avatar: 'default_avatar.png'
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

  async getMatchHistory(userIdRaw: number | string) {
    try {
      const userId = parseInt(userIdRaw as string);

      console.log('userId: ', userId);
      const matches = await this.prisma.match.findMany({
        where: {
          OR: [{ winnerId: userId }, { loserId: userId }]
        },
        include: {
          winner: {
            select: { username: true }
          },
          loser: {
            select: { username: true }
          }
        }
      });
      console.log('matches: ', matches);
      return matches;
    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(`No user found`);
      }
      throw error;
    }
  }


  async unlockAchievement(userId: number, achievementTitle: string) {
    try {
      const achievement = await this.prisma.achievement.findFirst({
        where: {
          title: achievementTitle
        }
      });

      if (!achievement) {
        throw new Error('No such achievement with the given title.');
      }

      // Check if the user has already unlocked this achievement
      const existingAchievement = await this.prisma.userAchievement.findFirst({
        where: {
          userId: userId,
          achievementId: achievement.id
        }
      });
    
      if (existingAchievement) {
        return ;
      }

      // Unlock the achievement for the user
      const unlockedAchievement = await this.prisma.userAchievement.create({
        data: {
          userId: userId,
          achievementId: achievement.id
        }
      });
    
      console.log('Achievement unlocked:', unlockedAchievement);
      return unlockedAchievement;

    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(`Error unlocking the achievement.`);
      }
      throw error;
    }
  }


  async getAchievements(userIdRaw: number | string) {
    try {
      const userId = parseInt(userIdRaw as string);

      const achievements = await this.prisma.userAchievement.findMany({
        where: {
          userId: userId
        },
        include: {
          achievement: true
        }
      });
      
      console.log('Achievements:', achievements);
      return achievements;

    } catch (error) {
      this.logger.error(error.message);
      if (error instanceof PrismaClientKnownRequestError) {
        throw new NotFoundException(`Error unlocking the achievement.`);
      }
      throw error;
    }
  }

  async updateAchievements(userId: number) {
    const matches = await this.getMatchHistory(userId);
    console.log('matches: ', matches);
    if (matches.length >= 1) {
      this.unlockAchievement(userId, 'Noob');
    }
    if (matches.length >= 10) {
      this.unlockAchievement(userId, 'Dedication');
    }
    if (matches.length >= 100) {
      this.unlockAchievement(userId, 'Psycho');
    }
    if (matches.filter((match) => match.winnerId === userId).length >= 1) {
      this.unlockAchievement(userId, 'First blood');
    }
    if (matches.filter((match) => match.winnerId === userId).length >= 3) {
      this.unlockAchievement(userId, 'Little by little');
    }
    if (matches.filter((match) => match.loserId === userId).length >= 1) {
      this.unlockAchievement(userId, 'Learning the hard way');
    }
    if (matches.filter((match) => match.loserId === userId).length >= 3) {
      this.unlockAchievement(userId, 'Bad day');
    }
  }
}
