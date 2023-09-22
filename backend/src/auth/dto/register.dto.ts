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
    minLowercase: 2,
    minUppercase: 2,
    minNumbers: 2,
    minSymbols: 2
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  nickname?: string;
}
