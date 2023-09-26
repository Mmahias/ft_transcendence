import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');
  // FIX IT
  // app.enableCors({
  //   origin: 'http://localhost:3001', // replace with your front-end domain/port
  //   methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
  //   credentials: true,
  // });
  await app.listen(3030);
  console.log('Server running on http://localhost:3030');
}

bootstrap();



// // HTTPS version

// import { NestFactory } from '@nestjs/core';
// import { AppModule } from './app.module';
// import * as fs from 'fs';
// import { ExpressAdapter } from '@nestjs/platform-express';
// import * as https from 'https';
// const express = require('express');
// import { LoggerMiddleware } from './middlewares/logger-middleware';

// async function bootstrap() {
//   const server = express();

//   const httpsOptions = {
//     key: fs.readFileSync('/Users/leonardkrief/42/ft_transcendence/backend/server.key'),
//     cert: fs.readFileSync('/Users/leonardkrief/42/ft_transcendence/backend/server.cert'),
//   };

//   const app = await NestFactory.create(
//     AppModule,
//     new ExpressAdapter(server),
//   );
//   app.enableCors();  // This allows any origin. Be cautious in production!
//   app.setGlobalPrefix('api');
//   app.use(LoggerMiddleware);


//   // Instead of app.listen, use https server
//   https.createServer(httpsOptions, server)
//     .listen(3030, () => {
//       console.log('Server running on https://localhost:3030');
//     });
// }

// bootstrap();
