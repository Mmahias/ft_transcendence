import { IsOptional, IsNotEmpty, IsNumber, IsString, Length } from "class-validator";
import { User } from '@prisma/client';

export class CreateMessageDto {

  @IsNotEmpty()
  @IsNumber()
  channelId: number;

  @IsOptional()
  from: User;

  @IsNotEmpty()
  @IsNumber()
  fromId: number;

  @IsNotEmpty()
  @IsString()
  fromUsername: string;

  @IsNotEmpty()
  @IsString()
  to: string;

  @IsNotEmpty()
  @IsString()
  @Length(1, 1000)
  content: string;
}

