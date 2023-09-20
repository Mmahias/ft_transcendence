import { 
  Controller, Body, Get, Post, Patch, Delete, Param, Query 
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { CreateChannelDto } from './dto/create-channel.dto';
import { UpdateChannelDto } from './dto/update-channel.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { ApiTags } from "@nestjs/swagger";
import { ChanMode, Message } from '@prisma/client';



@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  /*******************/
  /*    CHANNELS     */
  /*******************/

  // ----- CREATE -----

  // POST /chat/channel
  @Post('channel')
  createChannel(@Body() body: CreateChannelDto) {
      return this.chatService.createChannel(body);
  }

  // ----- READ -----

  // GET /chat/channel/:channelId
  @Get('channel/:channelId')
  getChannelById(@Param('channelId') channelId: string) {
      return this.chatService.getChannelById(+channelId);
  }

  // GET /chat/channels?name=myChan
  @Get('channel')
  getChannelByName(@Query('name') channelName: string) {
      return this.chatService.getChannelByName(channelName);
  }

  // channels in which user is not but could pretend to join
  // GET /chat/channels/access/123
  @Get('channel/access/:userId')
  getAccessibleChannels(@Param('userId') userId: string) {
    return this.chatService.getDisplayableChans(+userId);
  }

  // channels in which user is a joinedUser
  // GET /chat/users/:userId/channels
  @Get('users/:userId/channels')
  getUserChannels(@Param('userId') userId: string) {
      return this.chatService.getAllChannelsByUserId(+userId);
  }

  // Filter by channel mode (public, private, protected, dm)
  // GET /chat/users/:userId/channels?mode=public
  @Get('users/:userId/channels')
  getChannelsByMode(@Param('userId') userId: string, @Query('mode') mode: ChanMode) {
      return this.chatService.getChannelsByUserIdAndMode(+userId, mode);
  }

  // GET /chat/channels/:channelId/password-check?userInput=testpwd
  @Get('channel/:channelId/password-check')
  comparePasswords(@Param('channelId') channelId: string, @Query('userInput') userInput: string) {
      return this.chatService.compareChannelPassword(+channelId, userInput);
  }

  // ----- UPDATE -----

  // PATCH /chat/channels/:channelId
  @Patch('channel/:channelId')
  updateChannel(@Param('channelId') channelId: string, @Body() body: UpdateChannelDto) {
      return this.chatService.updateChannel(+channelId, body);
  }

  // PATCH /chat/channels/:channelId/password
  @Patch('channel/:channelId/password')
  updatePassword(@Param('channelId') channelId: string, @Body() body: CreateChannelDto) {
      return this.chatService.updateChannelPassword(+channelId, body);
  }

  // POST or PUT /chat/channels/:channelId/users could be used
  // Depending on whether you see the user list update as a total replacement or addition
  @Post('channel/:channelId/users')
  updateChannelUserlist(@Param('channelId') channelId: string, @Body() body: UpdateChannelDto) {
      return this.chatService.updateChannelUserlist(+channelId, body);
  }

  // ----- DELETE -----

  // DELETE /chat/channels/:channelId
  @Delete('channel/:channelId')
  deleteChannel(@Param('channelId') channelId: string) {
      return this.chatService.deleteChannelById(+channelId);
  }

  // DELETE /chat/channels/:channelId/users
  @Delete('channel/:channelId/users')
  removeUserFromChannel(@Param('channelId') channelId: string, @Body() body: UpdateChannelDto) {
      return this.chatService.deleteUserFromChannel(+channelId, body);
  }

  /*******************/
  /*    MESSAGES     */
  /*******************/
  
  // POST /chat/message
  @Post('message')
  createMessage(@Body() body: CreateMessageDto) {
    return this.chatService.createMessage(body);
  }

  // POST /chat/messages/123
  @Get('messages/:channelId')
  getAllMessages(@Param('channelId') channelId: string) {
    return this.chatService.getAllMessagesByChannelId(+channelId);
  }

  // DELETE /chat/messages/123
  @Delete('messages/:channelId')
  deleteAllMessages(@Param('channelId') channelId: string) {
    return this.chatService.deleteMessagesByChannelId(+channelId);
  }
}
