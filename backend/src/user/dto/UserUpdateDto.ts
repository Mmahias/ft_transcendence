import { IsNotEmpty } from 'class-validator';

export class UserUpdateDto {
  @IsNotEmpty()
  nickname: string;
}
