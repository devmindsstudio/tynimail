import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ValidationError, BadRequestException } from '@nestjs/common';
import { error } from '@/responses';
import { HttpExceptionFilter } from '@/filters/http-exception.filter';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors({
    origin: process.env.CORS_ORIGIN || '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  app.useGlobalPipes(
    new ValidationPipe({
      stopAtFirstError: true,
      whitelist: true, // Removes any properties not defined in the DTO
      forbidNonWhitelisted: true, // Optionally throw an error if any unknown properties are found
      exceptionFactory: (errors: ValidationError[]) => {
        const errorMessage = errors
          .map((error) => {
            if (error.constraints) {
              const firstConstraintKey = Object.keys(error.constraints)[0];
              return error.constraints[firstConstraintKey];
            }
            return null;
          })
          .join(', ');
        return new BadRequestException(error(errorMessage, 'VALIDATION-ERROR'));
      },
    }),
  );

  // Bull Board auth middleware — protect /admin/queues with a static token
  const adminQueueToken = process.env.ADMIN_QUEUE_TOKEN;
  if (adminQueueToken) {
    app.use('/admin/queues', (req: any, res: any, next: any) => {
      const token = req.headers['x-admin-token'];
      if (token !== adminQueueToken) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
      next();
    });
  }

  // Permissive CORS for all tracking endpoints — called from customer websites (cross-origin)
  app.use(['/t/w', '/t/e', '/t/js', '/t/identify', '/t/click'], (req: any, res: any, next: any) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    if (req.method === 'OPTIONS') {
      res.status(204).send();
      return;
    }
    next();
  });

  app.setGlobalPrefix('api/v1', { exclude: ['/admin/queues', '/t/w', '/t/e', '/t/js', '/t/identify', '/t/click'] });

  const port = process.env.PORT || 3000;
  const host = process.env.HOST || '0.0.0.0';
  // const baseUrl = `http://${host === '0.0.0.0' ? 'localhost' : host}:${port}`;

  const config = new DocumentBuilder()
    .setTitle('Tynimail API')
    .setDescription('The Tynimail API documentation')
    .setVersion('1.0')
    // .addServer(baseUrl, 'API v1')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    include: [AppModule],
    deepScanRoutes: true,
  });
  SwaggerModule.setup('api', app, document);

  console.log(`Application environment: ${process.env.NODE_ENV}`);
  console.log(`Application is running on ${host}:${port}`);
  await app.listen(port, host);
}

bootstrap();
