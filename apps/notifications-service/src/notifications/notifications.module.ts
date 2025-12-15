import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Notification, Task } from "@repo/db";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { RABBITMQ_CLIENTS, RABBITMQ_QUEUES } from "@repo/common/constants";
import { ConfigKeys } from "../config.schema";
import { NotificationsController } from "./notifications.controller";
import { NotificationsService } from "./notifications.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification, Task]),
    ClientsModule.registerAsync([
      {
        name: RABBITMQ_CLIENTS.API_GATEWAY,
        imports: [ConfigModule],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.RMQ,
          options: {
            urls: [configService.get<string>(ConfigKeys.RABBITMQ_URL)],
            queue: RABBITMQ_QUEUES.API_GATEWAY_QUEUE,
            queueOptions: {
              durable: false,
            },
          },
        }),
        inject: [ConfigService],
      },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [NotificationsService],
})
export class NotificationsModule {}
