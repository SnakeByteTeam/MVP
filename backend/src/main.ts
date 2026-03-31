import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import helmet from 'helmet'; //Middleware per la sicurezza HTTP, setta correttamente gli header HTTP per proteggere da vulnerabilità note.

import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';


async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  app.use(helmet());
  app.enableCors({
    //origin: process.env.FRONTEND_URL, sostituito poi con l'url del frontend
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('View4Life API')
    .setDescription('View4Life API documentation')
    .setVersion('1.0')
    .addBearerAuth(
      {
        description: `[just text field] Please enter token in following format: Bearer <JWT>`,
        name: 'Authorization',
        bearerFormat: 'JWT',
        scheme: 'Bearer',
        type: 'http',
        in: 'Header',
      },
      'access-token',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
