import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length
} from 'class-validator';

export class UserUpdateDto {

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(2, 20)
  nickname: string;
}
