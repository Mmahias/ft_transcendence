import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { User } from '@app/user/decorator';
import { FriendRequestDto } from '@app/friend/dto';
import { FriendService } from '@app/friend/friend.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('friend')
export class FriendController {
  constructor(private friendService: FriendService) {}
  @Post('/request')
  async friendRequest(@User('id') id: number, @Body() body: FriendRequestDto) {
    return this.friendService.createRequest(id, body.friendNickname);
  }
}
