import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as Sentry from '@sentry/node';
import 'dotenv/config';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  Sentry.init({
    dsn: 'https://622d7bab2c784ac283b50ffb212c4788@o4504937608970240.ingest.sentry.io/4504937622798336',
    environment: process.env.ENVIRONMENT,
    release: process.env.RELEASE
  });

  const config = new DocumentBuilder()
    .setTitle('NG GrandRP - Backend')
    .setVersion('1.0')
    .addServer('http://localhost:3000', 'Local')
    .addServer(process.env.API_URI, 'Production')
    .addSecurity('apiKey', {
      type: 'apiKey',
      in: 'header',
      name: 'authorization'
    })
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);
  
  await app.listen(3000);
}
bootstrap();
