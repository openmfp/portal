import { AppModule } from './app.module.js';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as fs from 'fs';

async function bootstrap() {
  let app: NestExpressApplication;
  try {
    const key = fs.readFileSync('./openssl/key.pem');
    const cert = fs.readFileSync('./openssl/cert.pem');
    const httpsOptions = {
      key,
      cert,
    };
    app = await NestFactory.create<NestExpressApplication>(AppModule, {
      httpsOptions,
    });
  } catch (error) {
    app = await NestFactory.create<NestExpressApplication>(AppModule);
  }

  await app.listen(process.env.PORT || 3000);
}
bootstrap();