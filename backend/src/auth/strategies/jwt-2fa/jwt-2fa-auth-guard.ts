import { AuthGuard } from '@nestjs/passport';

export class Jwt2faAuthGuard extends AuthGuard('jwt-2fa') {}
