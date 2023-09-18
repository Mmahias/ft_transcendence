import { Controller, Body, Get, Post, Patch, Delete, Param, Query } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ApiTags } from "@nestjs/swagger";

@ApiTags('Chat')
@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) { }

}