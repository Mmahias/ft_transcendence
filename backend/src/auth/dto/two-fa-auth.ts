import { IsNotEmpty } from 'class-validator';

export class TwoFaAuth {
  @IsNotEmpty()
  twoFactorAuthenticationCode: string;
}
