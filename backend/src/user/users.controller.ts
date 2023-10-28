import { Response } from 'express';
import { UserService } from './users.service';
import {
  Controller,
  Get,
  UseGuards,
  Query,
  Post,
  Res,
  Logger,
  UseInterceptors,
  UploadedFile,
  Next,
  Param,
  Put,
  Body
} from '@nestjs/common';
import { User } from './decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@app/user/validator';
import { JwtAuthGuard } from '@app/auth/strategies/jwt/jwt-auth.guard';
import { UserUpdateDto } from '@app/user/dto';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get('isLoggedIn')
  async isLoggedIn() {
    return true;
  }

  @Get('me')
  async userInformation(@User('id') userId: number) {
    const user = await this.userService.getUserById(userId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, authenticationSecret, ...otherUserFields } = user;
    return otherUserFields;
  }

  @Get()
  async userByUsername(@Query('username') username: string) {
    const user = await this.userService.getUserByUsername(username || '');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password, authenticationSecret, ...otherUserFields } = user;
    return otherUserFields;
  }

  @Put('update')
  async updateNickname(@User('id') userId: number, @Body() userUpdate: UserUpdateDto) {
    return this.userService.updateUser(userId, userUpdate);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async uploadFile(@User('id') id: number, @UploadedFile() file: Express.Multer.File) {
    await this.userService.updateUserAvatarFilename(id, file.filename);
  }

  @Get('avatar')
  async userAvatar(@User('id') id: number, @Res() res: Response, @Next() next) {
    const { avatar } = await this.userService.getAvatarFilenameById(id);
    return res.sendFile(`${avatar}`, { root: 'avatars' }, (err) => {
      if (err) {
        this.logger.error(err.message);
        next();
      }
    });
  }

  @Get('searchUsers')
  async searchUsers(
    @Query('searchTerm') searchTerm: string,
    @Query('nbUsers') nbUsers: number
  ) {
    return await this.userService.searchUsers(searchTerm, nbUsers);
  }

  @Get('avatar/:username')
  async userAvatarByNickname(
    @Param('username') username,
    @Res() res: Response,
    @Next() next
  ) {
    const { avatar } = await this.userService.getAvatarFilenameByUsername(username);
    return res.sendFile(`${avatar}`, { root: 'avatars' }, (err) => {
      if (err) {
        this.logger.error(err.message);
        next();
      }
    });
  }

  @Get('getMatchHistory')
  async getMatchHistory(@Query('userId') userId: number) {
    return await this.userService.getMatchHistory(userId);
  }

  @Get('getAchievements')
  async geAchievements(@Query('userId') userId: number) {
    return await this.userService.getAchievements(userId);
  }

  @Post('/blockuser/:username')
  async blockUser(@User('id') userId, @Param('username') username) {
    return this.userService.blockUser(userId, username);
  }

  @Post('/unblockuser/:username')
  async unblockUser(@User('id') userId, @Param('username') username) {
    return this.userService.unblockUser(userId, username);
  }
}
