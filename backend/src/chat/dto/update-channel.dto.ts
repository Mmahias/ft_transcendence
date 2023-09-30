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
  @IsIn(['adminUsers', 'joinedUsers', 'bannedUsers', 'kickedUsers', 'mutedUsers'])
  usergroup: string;

  @IsOptional()
  @IsIn(['connect', 'disconnect'])
  action: string;
}