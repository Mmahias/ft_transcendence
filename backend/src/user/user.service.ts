import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

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
}
