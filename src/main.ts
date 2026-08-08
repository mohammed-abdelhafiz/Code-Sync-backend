import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { serve } from 'inngest/express';
import { getInngestFunctions, inngest } from './lib/inngest';
import { UsersService } from './users/users.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, {
    bodyParser: true,
  });

  app.useBodyParser('json', {
    limit: '10mb',
  });

  app.enableCors({
    origin: process.env.CLIENT_URL,
    credentials: true,
  });

  const usersService = app.get(UsersService);

  const functions = getInngestFunctions(usersService);

  app.use(
    '/api/inngest',
    serve({
      client: inngest,
      functions,
    }),
  );

  app.setGlobalPrefix('api');

  await app.listen(process.env.PORT ?? 5000);
}

bootstrap();
