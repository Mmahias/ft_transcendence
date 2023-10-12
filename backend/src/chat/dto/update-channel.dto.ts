import { IsOptional, IsIn, Length } from "class-validator";
import { ChanMode } from "../../shared/types"

export class UpdateChannelDto {

  @IsOptional()
  id: number;

  @IsOptional()
  @Length(2, 10)
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