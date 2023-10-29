import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  IsStrongPassword
} from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  @Length(4, 20)
  username: string;

  // FIX IT: Uncomment policy
  @IsString()
  @IsNotEmpty()
  @IsStrongPassword({
   minLength: 4,
   minLowercase: 1,
   minUppercase: 1,
   minNumbers: 1,
   minSymbols: 1
  })
  password: string;

  @IsString()
  @IsNotEmpty()
  @IsOptional()
  @Length(2, 20)
  nickname?: string;
}
