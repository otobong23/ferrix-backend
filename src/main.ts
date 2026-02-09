import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { config } from 'dotenv';
import * as bodyParser from 'body-parser';
config()

const port = process.env.PORT || 4000

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(bodyParser.json({ limit: '10mb' }));      // for JSON bodies
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors({
    origin: ['http://localhost:3000', 'https://ferrix.app', 'https://www.ferrix.app'], // allow requests from your frontend
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,               // allow cookies/auth headers if needed
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // strips properties not in the DTO
      forbidNonWhitelisted: true, // throws error if extra properties
      transform: true, // transforms plain JSON into class instances
    }),
  );

  await app.listen(port);
}
bootstrap();
