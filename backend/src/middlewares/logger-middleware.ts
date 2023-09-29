import { Injectable, NestMiddleware } from '@nestjs/common';
import chalk from 'chalk';

chalk.level = 2;
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const startTime = Date.now();

    const colors = {
      method: this.getColorForMethod(req.method),
      url: chalk.yellow,
      status: (code: number) => code >= 500 ? chalk.bgRed.white 
                               : code >= 400 ? chalk.red
                               : chalk.green,
      time: chalk.cyan
    };

    res.on('finish', () => {
      const elapsedTime = Date.now() - startTime;
      const status = res.statusCode;
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const formattedTime = `${hours}:${minutes}:${seconds}`;

      console.log(
        `${colors.time(`[${formattedTime}]`)} ${colors.method(req.method)} - ${colors.url(req.originalUrl)} - ${colors.status(status)(status)} (${elapsedTime}ms)`
      );
    });

    next();
  }

  private getColorForMethod(method: string) {
    const methodColors: { [key: string]: chalk.Chalk} = {
      GET: chalk.blue,
      POST: chalk.magenta,
      PUT: chalk.white,
      DELETE: chalk.red,
      PATCH: chalk.yellow,
      OPTIONS: chalk.green
    };
    return methodColors[method] || chalk.gray;
  }
}
