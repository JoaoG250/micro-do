import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { NotificationsModule } from "./notifications/notifications.module";
import { validationSchema, ConfigKeys } from "./config.schema";
import { Notification, Task, Comment, User, AuditLog } from "@repo/db";
import { join, dirname } from "path";

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
        entities: [Notification, Task, Comment, User, AuditLog],
        synchronize: false,
        migrationsRun: true,
        migrations: [
          join(
            dirname(require.resolve("@repo/db/package.json")),
            "dist/migrations/*.js",
          ),
        ],
      }),
      inject: [ConfigService],
    }),
    NotificationsModule,
  ],
})
export class AppModule {}
