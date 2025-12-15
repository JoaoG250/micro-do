import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User, Task, Comment, AuditLog } from "@repo/db";
import { AuthModule } from "./auth/auth.module";
import { validationSchema, ConfigKeys } from "./config.schema";
import { join, dirname } from "path";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        type: "postgres",
        host: configService.get<string>(ConfigKeys.POSTGRES_HOST),
        port: configService.get<number>(ConfigKeys.POSTGRES_PORT),
        username: configService.get<string>(ConfigKeys.POSTGRES_USER),
        password: configService.get<string>(ConfigKeys.POSTGRES_PASSWORD),
        database: configService.get<string>(ConfigKeys.POSTGRES_DB),
        entities: [User, Task, Comment, AuditLog],
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
    AuthModule,
  ],
})
export class AppModule {}
