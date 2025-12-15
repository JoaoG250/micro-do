import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Transport, MicroserviceOptions } from "@nestjs/microservices";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import {
  RABBITMQ_QUEUES,
  REFRESH_TOKEN_COOKIE_NAME,
} from "@repo/common/constants";
import { AppModule } from "./app.module";
import { ConfigKeys } from "./config.schema";

import cookieParser from "cookie-parser";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.useGlobalPipes(new ValidationPipe());
  const configService = app.get<ConfigService>(ConfigService);

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.RMQ,
    options: {
      urls: [configService.get<string>(ConfigKeys.RABBITMQ_URL)],
      queue: RABBITMQ_QUEUES.API_GATEWAY_QUEUE,
      queueOptions: {
        durable: false,
      },
      noAck: true,
    },
  });

  const config = new DocumentBuilder()
    .setTitle("Jungle Do API")
    .setDescription("Jungle Do API Swagger documentation")
    .setVersion("1.0")
    .addCookieAuth(REFRESH_TOKEN_COOKIE_NAME)
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("api/docs", app, document);

  await app.startAllMicroservices();
  await app.listen(configService.get<number>(ConfigKeys.PORT) ?? 3000);
}
void bootstrap();
