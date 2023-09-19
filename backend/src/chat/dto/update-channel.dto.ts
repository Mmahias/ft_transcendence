import { IsOptional, IsIn } from "class-validator";
import { 
  ChanMode, 
  User, 
  Message 
} from '@prisma/client';

export class UpdateChannelDto {

  @IsOptional()
  name: string;

  @IsOptional()
  mode: ChanMode;

  @IsOptional()
  password: string;

  @IsOptional()
  adminUsers : User[];

  @IsOptional()
  joinedUsers: User[];

  @IsOptional()
  bannedUsers: User[];

  @IsOptional()
  kickedUsers: User[];

  @IsOptional()
  mutedUsers : User[];
  
  @IsOptional()
  @IsIn(['adminUsers', 'joinedUsers', 'bannedUsers', 'kickedUsers', 'mutedUsers'])
  usergroup: string;

  @IsOptional()
  @IsIn(['connect', 'disconnect'])
  action: string;
  
  @IsOptional()
  userId: number;

  @IsOptional()
  messages: Message[];
}