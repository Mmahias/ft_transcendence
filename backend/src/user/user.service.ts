import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { UserDto } from './dto';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);
  constructor(private prisma: PrismaService) {}

  async getAllUser() {
    return this.prisma.user.findMany();
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
        this.logger.error(error.message);
        if (error instanceof PrismaClientKnownRequestError) {
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
          email: email
        }
      })
      .catch((error) => {
        if (error instanceof PrismaClientKnownRequestError) {
          if (error.code === 'P2002') {
            throw new ForbiddenException(`Login [${login}] is already taken`);
          }
        }
      });
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
        this.logger.error(error.message);
        if (error instanceof PrismaClientKnownRequestError) {
          throw new NotFoundException(`User id [${id}] is not found`);
        }
        throw error;
      });
  }
}
