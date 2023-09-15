import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserDto, UserUpdateDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

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

  async getUserByLogin42(login: string) {
    return this.prisma.user
      .findUniqueOrThrow({
        where: {
          login_42: login
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
          this.logger.log(`Login [${login}] is not found`);
          throw new NotFoundException(`Login [${login}] is not found`);
        }
        throw error;
      });
  }

  async createUser(login: string, email: string) {
    return this.prisma.user
      .create({
        data: {
          login_42: login,
          nickname: login,
          email: email,
          avatar: 'default_path_avatar'
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException(`Login [${login}] is already taken`);
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
}
