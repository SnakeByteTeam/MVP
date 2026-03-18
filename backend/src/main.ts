import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet'; //Middleware per la sicurezza HTTP, setta correttamente gli header HTTP per proteggere da vulnerabilità note. 

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.enableCors({
    //origin: process.env.FRONTEND_URL, sostituito poi con l'url del frontend
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('View4Life API')
    .setDescription('View4Life API documentation')
    .setVersion('1.0')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, documentFactory);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
