import { Response } from 'express';
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
import { UserService } from './user.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from './decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '@app/user/validator';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UserController {
  private readonly logger = new Logger(UserController.name);
  constructor(private userService: UserService) {}
  @Get()
  async allUsers() {
    return this.userService.getAllUser();
  }
  @Get('me')
  async userInformation(@User('id') id: number) {
    return this.userService.getUserById(id);
  }

  @Get()
  async userByNickname(@Query('nickname') nickname: string) {
    return this.userService.getUserByNickname(nickname);
  }

  @Post('avatar')
  @UseInterceptors(FileInterceptor('avatar', multerOptions))
  async uploadFile(@User('id') id: number, @UploadedFile() file: Express.Multer.File) {
    await this.userService.updateUserAvatarFilename(id, file.filename);
  }

  @Get('avatar')
  async userAvatar(@User('id') id: number, @Res() res: Response, @Next() next) {
    const { avatarFilename } = await this.userService.getAvatarFilenameById(id);
    return res.sendFile(`${avatarFilename}`, { root: 'avatars' }, (err) => {
      if (err) {
        this.logger.error(err.message);
        next();
      }
    });
  }

  @Get('avatar/:nickname')
  async userAvatarByNickname(
    @Param('nickname') nickname,
    @Res() res: Response,
    @Next() next
  ) {
    const { avatarFilename } =
      await this.userService.getAvatarFilenameByNickname(nickname);
    return res.sendFile(`${avatarFilename}`, { root: 'avatars' }, (err) => {
      if (err) {
        this.logger.error(err.message);
        next();
      }
    });
  }
}
