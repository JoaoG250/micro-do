import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { RABBITMQ_QUEUES } from "@repo/common/constants";
import { ConfigService } from "@nestjs/config";
import { ConfigKeys } from "./config.schema";
import { ValidationPipe } from "@nestjs/common";

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const configService = appContext.get<ConfigService>(ConfigService);

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.RMQ,
      options: {
        urls: [configService.get<string>(ConfigKeys.RABBITMQ_URL)],
        queue: RABBITMQ_QUEUES.NOTIFICATIONS_QUEUE,
        queueOptions: {
          durable: false,
        },
        noAck: true,
      },
    },
  );
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  await app.listen();
}
void bootstrap();
