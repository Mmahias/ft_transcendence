import { PrismaClient } from '@prisma/client';
import { Injectable } from '@nestjs/common';

@Injectable()
export class PrismaService extends PrismaClient {
  async cleanDb() {
    if (process.env.NODE_ENV === 'production') return;
    const models = ['user', 'friendRequest'];

    return Promise.all(models.map((modelKey) => this[modelKey].deleteMany()));
  }
}
