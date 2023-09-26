import { Test } from '@nestjs/testing';
import { UserModule } from '../users.module';
import { UserService } from '../users.service';
import { User } from '@prisma/client';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserDto, UserUpdateDto } from '../dto';
import { PrismaService } from '@app/prisma/prisma.service';

describe('UserService integration test', () => {
  let prisma: PrismaService;
  let userService: UserService;
  let userCreated: User;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [UserModule]
    }).compile();
    prisma = moduleRef.get(PrismaService);
    userService = moduleRef.get(UserService);
    await prisma.cleanDb();
  });

  describe('create user', () => {
    it('should create a user', async () => {
      expect.assertions(3);

      userCreated = await userService.createUser('login42', 'login42@gmail.com');
      expect(userCreated.login_42).toBe('login42');
      expect(userCreated.nickname).toBe('login42');
      expect(userCreated.email).toBe('login42@gmail.com');
    });

    it('throw error when login is already taken', async () => {
      expect.assertions(1);

      await expect(
        userService.createUser('login42', 'login43@gmail.com')
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });

  describe('retrieve user', () => {
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

    it('should retrieve user by nickname', async () => {
      const expected: UserDto = {
        id: userCreated.id,
        nickname: userCreated.nickname
      };

      await userService.getUserByNickname('login42').then((userDto) => {
        expect(userDto).toStrictEqual(expected);
      });
    });

    it('throw error if user id is not found', async () => {
      await expect(userService.getUserById(99)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('throw error if login is not found', async () => {
      await expect(userService.getUserByLogin42('login_unknown')).rejects.toBeInstanceOf(
        NotFoundException
      );
    });

    it('throw error if nickname is not found', async () => {
      await expect(
        userService.getUserByNickname('nickname_unknown')
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('update a user', () => {
    it('should update user', async () => {
      expect.assertions(1);
      await userService
        .updateUser(userCreated.id, new UserUpdateDto('NEW_NICKNAME'))
        .then((userUpdated) => {
          expect(userUpdated.nickname).toBe('NEW_NICKNAME');
        });
    });

    it('throw an error when nickname is already taken', async () => {
      expect.assertions(1);

      const { id } = await prisma.user.create({
        data: {
          login_42: 'login43',
          nickname: 'login43',
          email: 'login43@mail',
          avatar: 'default_path'
        }
      });

      await expect(
        userService.updateUser(id, new UserUpdateDto('NEW_NICKNAME'))
      ).rejects.toBeInstanceOf(ForbiddenException);
    });
  });
});
