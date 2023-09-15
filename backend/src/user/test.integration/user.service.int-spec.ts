import { PrismaService } from '../../prisma/prisma.service';
import { Test } from '@nestjs/testing';
import { UserModule } from '../user.module';
import { UserService } from '../user.service';
import { User } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserDto } from '../dto';

describe('UserService integration test', () => {
  let prisma: PrismaService;
  let userService: UserService;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule]
    }).compile();
    prisma = moduleRef.get(PrismaService);
    userService = moduleRef.get(UserService);
    await prisma.cleanDb();
  });

  describe('create user and try to retrieve', () => {
    let userCreated: User;

    it('should create a user', async () => {
      userCreated =
        (await userService.createUser('login42', 'login42@gmail.com')) || undefined;
      expect(userCreated.login_42).toBe('login42');
      expect(userCreated.nickname).toBe('login42');
      expect(userCreated.email).toBe('login42@gmail.com');
    });

    it('throw error when login is already taken', async () => {
      await expect(
        userService.createUser('login42', 'login43@gmail.com')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });

    it('should retrieve user by id', async () => {
      const expected: UserDto = {
        id: userCreated.id,
        nickname: userCreated.nickname
      };

      await userService.getUserById(userCreated.id).then((userDto) => {
        expect(userDto).toStrictEqual(expected);
      });
    });

    it('should retrieve user by login', async () => {
      const expected: UserDto = {
        id: userCreated.id,
        nickname: userCreated.nickname
      };

      await userService.getUserByLogin42('login42').then((userDto) => {
        expect(userDto).toStrictEqual(expected);
      });
    });

    it('throw error if user id not found', async () => {
      await expect(userService.getUserById(99)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throw error if login not found', async () => {
      await expect(userService.getUserByLogin42('login_unknown')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });
  });
});
