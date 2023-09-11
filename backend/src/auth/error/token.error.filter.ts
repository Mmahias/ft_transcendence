import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus
} from '@nestjs/common';
import { Response } from 'express';
import { TokenError } from 'passport-oauth2';

@Catch(TokenError)
export class TokenErrorFilter implements ExceptionFilter {
  catch(exception: TokenError, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    response.status(HttpStatus.BAD_GATEWAY).end(
      JSON.stringify({
        code: HttpStatus.BAD_GATEWAY,
        message: 'Error while authentication with oauth'
      })
    );
  }
}
