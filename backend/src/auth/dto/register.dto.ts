import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  Length
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(5, 20)
  username: string;

  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 6,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
    minSymbols: 1
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nickname?: string;
}
