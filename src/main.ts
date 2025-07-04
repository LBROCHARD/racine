import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // To authorise CORS in local developpement
  app.enableCors({
    origin: ['http://localhost:5173', 'https://echalote.onrender.com/'],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log('server started on port http://localhost:3000');
}
bootstrap();
