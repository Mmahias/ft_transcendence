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
  Param
} from '@nestjs/common';
import { User } from './decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@app/user/validator';
import { JwtAuthGuard } from '@app/auth/strategies/jwt/jwt-auth.guard';

@UseGuards(JwtAuthGuard)
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}

  @Get('me')
  async userInformation(@User('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get()
  async userByUsername(@Query('username') username: string) {
    console.log("BACK username: ", username)
    return this.userService.getUserByUsername(username);
  }

  @Get()
  async userByNickname(@Query('nickname') nickname: string) {
    console.log("BACK nickname: ", nickname)
    return this.userService.getUserByNickname(nickname);
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

  @Get('avatar/:nickname')
  async userAvatarByNickname(
    @Param('nickname') nickname,
    @Res() res: Response,
    @Next() next
  ) {
    const { avatar } = await this.userService.getAvatarFilenameByNickname(nickname);
    return res.sendFile(`${avatar}`, { root: 'avatars' }, (err) => {
      if (err) {
        this.logger.error(err.message);
        next();
      }
    });
  }
}
