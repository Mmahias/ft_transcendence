import { Injectable } from '@nestjs/common';
import { PrismaService } from '@app/prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async getAllUser() {
    return this.prisma.user.findMany();
  }

  async getUserByLogin42(login: string) {
    return this.prisma.user.findUnique({
      where: {
        login_42: login
      }
    });
  }

  async createUser(login: string, email: string) {
    return this.prisma.user.create({
      data: {
        login_42: login,
        nickname: login,
        email: email
      }
    });
  }

  async getUserById(id: number) {
    return this.prisma.user.findUnique({
      where: {
        id
      }
    });
  }
}
