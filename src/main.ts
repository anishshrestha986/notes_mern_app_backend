import { Logger, NestMiddleware, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import {
  SwaggerModule,
  DocumentBuilder,
  SwaggerDocumentOptions,
} from '@nestjs/swagger';
import { AppModule } from './app.module';
import { ConfigService } from './config/config.service';
import { NextFunction, urlencoded } from 'express';

async function bootstrap() {
  const config = new ConfigService();
  const logger = new Logger('bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: {
      origin: '*',
    },
  });

  const APP_NAME = 'Burning Proxies';
  const APP_VERSION = '1.0.0';

  const swaggerConfig = new DocumentBuilder()
    .setTitle(APP_NAME)
    .setDescription(`The ${APP_NAME} API description`)
    .setVersion(APP_VERSION)
    .addBearerAuth()
    .build();

  const swaggerOptions: SwaggerDocumentOptions = {
    operationIdFactory: (_: string, methodKey: string) => methodKey,
  };

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
    swaggerOptions,
  );
  SwaggerModule.setup('api-docs', app, document);
  app.use(function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept',
    );
    next();
  });
  app.use(urlencoded({ limit: '50mb', extended: true }));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  await app.listen(config.getPortConfig() || process.env.PORT || 8084);

  logger.log(
    `Nest application is running on: ${
      config.getPortConfig() || process.env.PORT || 8084
    }`,
  );
}
bootstrap();
