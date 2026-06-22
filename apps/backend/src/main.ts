import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { HttpExceptionFilter } from './core/exceptions/http-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Register global exception filter
  app.useGlobalFilters(new HttpExceptionFilter());
  
  // Enable validation globally
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // Enable CORS
  app.enableCors();

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`CourtMate NestJS Backend is running on: http://localhost:${port}`);
}
bootstrap();
