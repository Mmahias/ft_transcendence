import { IsOptional, IsIn } from "class-validator";
import { ChanMode } from "@ft-transcendence/shared/types"

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