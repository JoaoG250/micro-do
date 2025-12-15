import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsModule } from "./notifications/notifications.module";
import { validationSchema, ConfigKeys } from "./config.schema";
import { Notification, Task, Comment, User } from "@repo/db";

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema,
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>(ConfigKeys.POSTGRES_HOST),
        port: configService.get<number>(ConfigKeys.POSTGRES_PORT),
        username: configService.get<string>(ConfigKeys.POSTGRES_USER),
        password: configService.get<string>(ConfigKeys.POSTGRES_PASSWORD),
        database: configService.get<string>(ConfigKeys.POSTGRES_DB),
        entities: [Notification, Task, Comment, User],
        synchronize: true,
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
})
export class AppModule {}
