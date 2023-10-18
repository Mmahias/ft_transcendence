import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { FriendRequestDto } from '@app/friend/dto';
import { FriendService } from '@app/friend/friend.service';
import { AuthGuard } from '@nestjs/passport';
import { User } from '@app/user/decorator';

@UseGuards(AuthGuard('jwt'))
@Controller('friends')
export class FriendController {
  constructor(private friendService: FriendService) {}
  @Post('/request')
  async friendRequest(@User('id') id: number, @Body() body: FriendRequestDto) {
    return this.friendService.createRequest(id, body.username);
  }
}
