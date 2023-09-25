import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class HttpsMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    if (req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV !== 'development') {
      return res.redirect('https://' + req.headers.host + req.url);
    }
    next();
  }
}

// protected against open redirect attacks but dont understand how it works

// import { Injectable, NestMiddleware } from '@nestjs/common';
// import { Request, Response, NextFunction } from 'express';

// @Injectable()
// export class HttpsMiddleware implements NestMiddleware {
//   use(req: Request, res: Response, next: NextFunction) {
//     const allowedHosts = ['example.com', 'api.example.com'];

//     if (req.headers['x-forwarded-proto'] != 'https' && process.env.NODE_ENV !== 'development') {
//       if (!allowedHosts.includes(req.headers.host)) {
//         return res.status(400).send('Invalid host header');
//       }

//       const redirectUrl = new URL(req.url, 'https://' + req.headers.host);
//       return res.redirect(redirectUrl.toString());
//     }
//     next();
//   }
// }
