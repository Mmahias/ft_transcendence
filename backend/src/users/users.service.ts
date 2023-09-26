import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserDto, UserUpdateDto } from './dto';
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
        }
      })
      .then((user) => {
        const userDto: UserDto = {
          id: user.id,
          nickname: user.nickname
        };
        return userDto;
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
        }
      })
      .then((user) => {
        const userDto: UserDto = {
          id: user.id,
          nickname: user.nickname
        };
        return userDto;
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
          if (error.code === 'P2002') {
            throw new ForbiddenException(`Username [${username}] is already taken`);
          }
        }
        throw error;
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
        throw error;
      });
  }

<<<<<<< HEAD:backend/src/users/users.service.ts
  async checkIfLoggedIn(userId: number | undefined): Promise<boolean> {
    if (userId === undefined) {
      return false;
    } else {
      const ret: boolean = await this.prisma.user.findUnique({
        where: { id: userId }
      })
        .then(user => {
          if (user) { return true; }
          return false;
        }).catch(() => { return false });
      return ret;
    }
  }

=======
  async getAvatarFilenameById(userID: number) {
    return this.prisma.user
      .findUnique({
        where: {
          id: userID
        },
        select: {
          avatarFilename: true
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

  async getAvatarFilenameByNickname(nickname: string) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          nickname
        },
        select: {
          avatarFilename: true
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          this.logger.log(`Nickname [${nickname}] is not found`);
          throw new NotFoundException(`Nickname [${nickname}] is not found`);
        }
        throw error;
      });
  }

  async updateUserAvatarFilename(userId: number, filename: string) {
    return this.prisma.user.update({
      where: { id: userId },
      data: { avatarFilename: filename }
    });
  }
>>>>>>> b5cbb09eba67d2b70242c9d02e21c07755051dea:backend/src/user/user.service.ts
}
